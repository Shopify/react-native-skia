#pragma once

#include <memory>
#include <utility>
#include <thread>
#include <queue>
#include <mutex>
#include <condition_variable>

#include <jsi/jsi.h>

#include "JsiPromises.h"
#include "JsiSkData.h"
#include "JsiSkHostObjects.h"
#include "JsiSkImage.h"
#include "JsiSkImageInfo.h"

#include "include/gpu/ganesh/SkImageGanesh.h"
#include "include/core/SkImageGenerator.h"
#include "include/core/SkBitmap.h"
#include "RNSkLog.h"

// hack: from SkImageGeneratorPriv.h, declaration is not present in include header file
// this is not a part of the api and its signature might change
namespace SkImageGenerators {
  std::unique_ptr<SkImageGenerator> MakeFromEncoded(sk_sp<SkData>,
    std::optional<SkAlphaType> = std::nullopt);
}


namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkImageFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakeImageFromEncoded) {
    auto data = JsiSkData::fromValue(runtime, arguments[0]);
    auto image = SkImages::DeferredFromEncodedData(data);
    if (image == nullptr) {
      return jsi::Value::null();
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
  }

  JSI_HOST_FUNCTION(MakeCrossContextTextureFromEncoded) {
    auto data = JsiSkData::fromValue(runtime, arguments[0]);
    auto image = SkImages::DeferredFromEncodedData(data);
    if (image == nullptr) {
      return jsi::Value::null();
    }

     SkBitmap bmp;
     SkPixmap pixmap;
     if (!image->asLegacyBitmap(&bmp) || !bmp.peekPixels(&pixmap)) {
       return jsi::Value::null();
     }

     image.reset();

     auto crossContextImage = SkImages::CrossContextTextureFromPixmap(
             getContext()->getDirectContext(), pixmap, true, true);

     if (crossContextImage == nullptr) {
       return jsi::Value::null();
     }

    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(crossContextImage)));
  }

  JSI_HOST_FUNCTION(MakeImageFromNativeBuffer) {
    jsi::BigInt pointer = arguments[0].asBigInt(runtime);
    const uintptr_t nativeBufferPointer = pointer.asUint64(runtime);
    void *rawPointer = reinterpret_cast<void *>(nativeBufferPointer);
    auto image = getContext()->makeImageFromNativeBuffer(rawPointer);
    if (image == nullptr) {
      throw std::runtime_error("Failed to convert NativeBuffer to SkImage!");
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
  }

  JSI_HOST_FUNCTION(MakeImage) {
    auto imageInfo = JsiSkImageInfo::fromValue(runtime, arguments[0]);
    auto pixelData = JsiSkData::fromValue(runtime, arguments[1]);
    auto bytesPerRow = arguments[2].asNumber();
    auto image = SkImages::RasterFromData(*imageInfo, pixelData, bytesPerRow);
    if (image == nullptr) {
      return jsi::Value::null();
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
  }

  JSI_HOST_FUNCTION(MakeImageFromViewTag) {
    auto viewTag = arguments[0].asNumber();
    auto context = getContext();
    return RNJsi::JsiPromises::createPromiseAsJSIValue(
        runtime,
        [context = std::move(context), viewTag](
            jsi::Runtime &runtime,
            std::shared_ptr<RNJsi::JsiPromises::Promise> promise) -> void {
          context->makeViewScreenshot(
              viewTag, [&runtime, context = std::move(context),
                        promise = std::move(promise)](sk_sp<SkImage> image) {
                context->runOnJavascriptThread([&runtime,
                                                context = std::move(context),
                                                promise = std::move(promise),
                                                result = std::move(image)]() {
                  if (result == nullptr) {
                    promise->reject("Failed to create image from view tag");
                    return;
                  }
                  promise->resolve(jsi::Object::createFromHostObject(
                      runtime, std::make_shared<JsiSkImage>(
                                   std::move(context), std::move(result))));
                });
              });
        });
  }

  JSI_HOST_FUNCTION(MakeImageFromNativeTextureUnstable) {
    auto texInfo = JsiTextureInfo::fromValue(runtime, arguments[0]);
    auto image = getContext()->makeImageFromNativeTexture(
        texInfo, arguments[1].asNumber(), arguments[2].asNumber(),
        count > 3 && arguments[3].asBool());
    if (image == nullptr) {
      throw std::runtime_error("Failed to convert native texture to SkImage!");
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
  }

  static sk_sp<SkImage> DecodeDataToImage(sk_sp<SkData> data, GrDirectContext *dContext) {
    std::shared_ptr<SkImageGenerator> gen(SkImageGenerators::MakeFromEncoded(std::move(data)));

    // get GrContext
    if(gen == nullptr || !gen->isValid(nullptr)) {
      RNSkLogger::logToConsole("Could not determine image codec");
      return nullptr;
    }
    SkBitmap bitmap;
    auto info = gen->getInfo();

    try {
      // adding some additional checks here to make sure we have valid data
      if(bitmap.tryAllocPixels(info)) {
        gen->getPixels(info.makeColorSpace(nullptr), bitmap.getPixels(), bitmap.rowBytes());

#ifdef __ANDROID__
        SkPixmap pixmap;
        if (!bitmap.peekPixels(&pixmap)) {
          RNSkLogger::logToConsole("Decoding failed - Could not get pixels from bitmap.");
          return nullptr;
        }
        RNSkLogger::logToConsole("get CrossContextTexture");
        auto image = SkImages::CrossContextTextureFromPixmap(dContext, pixmap, true, true);
#else // iOS
        RNSkLogger::logToConsole("get cpu texture");
        auto image = bitmap.asImage();
#endif
        return image;
      } else {
        RNSkLogger::logToConsole("Decoding failed - tryAllocPixels failed.");
      }
    } catch(const std::exception e) {
      RNSkLogger::logToConsole(std::string() + "Exception while decoding image: " + e.what());
    }
    return nullptr;
  }

  bool decodingThreadRunning = false;
  struct WorkUnit {
    sk_sp<SkData> data;
    std::shared_ptr<RNJsi::JsiPromises::Promise> promise;
  };

  std::mutex dataMutex;
  std::condition_variable dataCV;
  std::queue<WorkUnit> workQueue;

  JSI_HOST_FUNCTION(MakeImageFromURL) {
    auto url = arguments[0].asString(runtime).utf8(runtime);
    auto context = getContext();

    // start the image decoding thread
    if(!decodingThreadRunning) {
      decodingThreadRunning = true;
      std::thread t0([this, &runtime, context]() -> void {
        auto dContext = context->getDirectContext();

        //dequeue data when available
        do {
          std::unique_lock<std::mutex> lock(dataMutex);

          if(workQueue.size() == 0) dataCV.wait(lock);
          while(workQueue.size() > 0) {
            WorkUnit workUnit = workQueue.front();
            workQueue.pop();

            auto data = workUnit.data;
            auto promise = workUnit.promise;

            auto image = DecodeDataToImage(data, dContext);

            // resolve the promise back on a js thread
            context->runOnJavascriptThread(
              [this,
              &runtime,
              context = std::move(context),
              promise = std::move(promise),
              image = std::move(image)]
              () -> void {
                RNSkLogger::logToConsole("Resolving promise.");
                if (image == nullptr) {
                  promise->reject("Failed to decode image");
                  return;
                }
                promise->resolve(jsi::Object::createFromHostObject(runtime,
                  std::make_shared<JsiSkImage>(std::move(context), std::move(image))));
              });
          }
          lock.unlock();
        } while(true); // do we want to manually dispose of this thread?

        decodingThreadRunning = false;
      });

      t0.detach();
    }

    return RNJsi::JsiPromises::createPromiseAsJSIValue(runtime,
      [this, context = std::move(context), url]
      (jsi::Runtime &runtime, std::shared_ptr<RNJsi::JsiPromises::Promise> promise) -> void {
        // run this on its own thread, not a js thread
        std::thread t1([this,
          &runtime,
          context = std::move(context),
          promise = std::move(promise),
          url]
          () -> void {
            // use skia's built-in network streaming method
            context->performStreamOperation(url,
              [this, &runtime, context = std::move(context), promise = std::move(promise)]
              (std::unique_ptr<SkStreamAsset> stream) -> void {
                auto data = SkData::MakeFromStream(stream.get(), stream->getLength());
                std::unique_lock<std::mutex> lock(dataMutex);
                WorkUnit workUnit;
                workUnit.data = data;
                workUnit.promise = promise;

                // enqueue the work unit
                workQueue.push(workUnit);

                // let the worker thread know there's work to be done
                dataCV.notify_all();
                lock.unlock();
              });
          });
      t1.detach();
    });
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkImageFactory, MakeImageFromEncoded),
                       JSI_EXPORT_FUNC(JsiSkImageFactory, MakeCrossContextTextureFromEncoded),
                       JSI_EXPORT_FUNC(JsiSkImageFactory, MakeImageFromViewTag),
                       JSI_EXPORT_FUNC(JsiSkImageFactory,
                                       MakeImageFromNativeBuffer),
                       JSI_EXPORT_FUNC(JsiSkImageFactory,
                                       MakeImageFromNativeTextureUnstable),
                       JSI_EXPORT_FUNC(JsiSkImageFactory, MakeImageFromURL),
                       JSI_EXPORT_FUNC(JsiSkImageFactory, MakeImage))

  explicit JsiSkImageFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
