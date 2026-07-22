#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkData.h"
#include "JsiSkImage.h"
#include "JsiSkImageInfo.h"
#include "JsiSkNativeObjects.h"
#include "jsi/JsiPromises.h"

#ifdef SK_GRAPHITE
#include "rnskia/RNDawnContext.h"
#include "rnwgpu/api/GPUTexture.h"
#endif

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkImageFactory : public JsiSkNativeObject<JsiSkImageFactory> {
public:
  static constexpr const char *CLASS_NAME = "ImageFactory";

  JSI_HOST_FUNCTION(MakeNull) {
    return makeJsiObject(runtime,
                         std::make_shared<JsiSkImage>(getContext(), nullptr));
  }

  JSI_HOST_FUNCTION(MakeImageFromEncoded) {
    auto data = JsiSkData::fromValue(runtime, arguments[0]);
    auto image = SkImages::DeferredFromEncodedData(data);
    if (image == nullptr) {
      return jsi::Value::null();
    }
    return makeJsiObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
  }

  JSI_HOST_FUNCTION(MakeImageFromNativeBuffer) {
    jsi::BigInt pointer = arguments[0].asBigInt(runtime);
    const uintptr_t nativeBufferPointer = pointer.asUint64(runtime);
    void *rawPointer = reinterpret_cast<void *>(nativeBufferPointer);
    auto image = getContext()->makeImageFromNativeBuffer(rawPointer);
    if (image == nullptr) {
      throw std::runtime_error("Failed to convert NativeBuffer to SkImage!");
    }
    return makeJsiObject(
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
    return makeJsiObject(
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
                  promise->resolve(
                      makeJsiObject(runtime, std::make_shared<JsiSkImage>(
                                                 context, std::move(result))));
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
    if (count > 4) {
      auto jsiImage = tryGetJsiObject<JsiSkImage>(runtime, arguments[4]);
      if (jsiImage) {
        jsiImage->setObject(image);
        return jsi::Value(runtime, arguments[4]);
      }
    }
    return makeJsiObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
  }

  JSI_HOST_FUNCTION(MakeImageFromTexture) {
#ifdef SK_GRAPHITE
    if (count < 1 || !arguments[0].isObject()) {
      throw std::runtime_error(
          "MakeImageFromTexture requires a GPUTexture argument");
    }
    auto obj = arguments[0].asObject(runtime);
    auto gpuTexture = obj.getNativeState<rnwgpu::GPUTexture>(runtime);
    if (!gpuTexture) {
      throw std::runtime_error("Invalid GPUTexture object");
    }

    wgpu::Texture texture = gpuTexture->get();
    int width = static_cast<int>(gpuTexture->getWidth());
    int height = static_cast<int>(gpuTexture->getHeight());
    wgpu::TextureFormat format = gpuTexture->getFormat();

    auto &dawnContext = DawnContext::getInstance();
    auto image =
        dawnContext.MakeImageFromTexture(texture, width, height, format);
    if (image == nullptr) {
      throw std::runtime_error("Failed to create SkImage from GPUTexture!");
    }
    return makeJsiObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
#else
    throw std::runtime_error(
        "MakeImageFromTexture is only available with the Graphite backend. "
        "Rebuild with SK_GRAPHITE enabled.");
#endif
  }

  JSI_HOST_FUNCTION(MakeTextureFromImage) {
#ifdef SK_GRAPHITE
    if (count < 1) {
      throw std::runtime_error(
          "MakeTextureFromImage requires an SkImage argument");
    }
    auto image = JsiSkImage::fromValue(runtime, arguments[0]);
    if (!image) {
      throw std::runtime_error("Invalid SkImage object");
    }

    auto &dawnContext = DawnContext::getInstance();
    wgpu::Texture texture = dawnContext.MakeTextureFromImage(image);
    if (!texture) {
      throw std::runtime_error("Failed to create GPUTexture from SkImage!");
    }

    auto gpuTexture =
        std::make_shared<rnwgpu::GPUTexture>(texture, "SkImage Texture");
    return rnwgpu::GPUTexture::create(runtime, gpuTexture);
#else
    throw std::runtime_error(
        "MakeTextureFromImage is only available with the Graphite backend. "
        "Rebuild with SK_GRAPHITE enabled.");
#endif
  }

  size_t getMemoryPressure() override { return 1024; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "MakeImageFromEncoded",
                      &JsiSkImageFactory::MakeImageFromEncoded);
    installHostMethod(runtime, prototype, "MakeImageFromViewTag",
                      &JsiSkImageFactory::MakeImageFromViewTag);
    installHostMethod(runtime, prototype, "MakeImageFromNativeBuffer",
                      &JsiSkImageFactory::MakeImageFromNativeBuffer);
    installHostMethod(runtime, prototype, "MakeImageFromNativeTextureUnstable",
                      &JsiSkImageFactory::MakeImageFromNativeTextureUnstable);
    installHostMethod(runtime, prototype, "MakeImage",
                      &JsiSkImageFactory::MakeImage);
    installHostMethod(runtime, prototype, "MakeNull",
                      &JsiSkImageFactory::MakeNull);
    installHostMethod(runtime, prototype, "MakeImageFromTexture",
                      &JsiSkImageFactory::MakeImageFromTexture);
    installHostMethod(runtime, prototype, "MakeTextureFromImage",
                      &JsiSkImageFactory::MakeTextureFromImage);
  }

  explicit JsiSkImageFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkNativeObject<JsiSkImageFactory>(std::move(context)) {}
};

} // namespace RNSkia
