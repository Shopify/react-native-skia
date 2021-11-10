#pragma once

#include <ReactCommon/TurboModuleUtils.h>

#include <tuple>

#include "JsiSkMatrix.h"
#include <JsiSkHostObjects.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkImage.h>
#include <SkStream.h>
#include <include/codec/SkCodec.h>

#pragma clang diagnostic pop

#include <jsi/jsi.h>

namespace RNSkia {

using namespace facebook;

class JsiSkImage : public JsiSkWrappingSkPtrHostObject<SkImage> {
public:
  JsiSkImage(RNSkPlatformContext *context, const sk_sp<SkImage> image,
             const std::string &localUri)
      : JsiSkWrappingSkPtrHostObject<SkImage>(context, image),
        _localUri(localUri) {
    installReadonlyProperty("width", [this](jsi::Runtime &rt) -> jsi::Value {
      return jsi::Value(getJsNumber(getObject()->width()));
    });

    installReadonlyProperty("height", [this](jsi::Runtime &) -> jsi::Value {
      return jsi::Value(getJsNumber(getObject()->height()));
    });

    installReadonlyProperty("uri", [this](jsi::Runtime &rt) -> jsi::Value {
      return jsi::String::createFromUtf8(rt, _localUri.c_str());
    });

    installFunction(
        "makeShader", JSI_FUNC_SIGNATURE {
          auto tmx = arguments[0].asNumber();
          auto tmy = arguments[1].asNumber();
          auto m = count == 3
                       ? JsiSkMatrix::fromValue(runtime, arguments[2]).get()
                       : nullptr;
          auto shader = getObject()->makeShader(
              (SkTileMode)tmx, (SkTileMode)tmy, SkSamplingOptions(), m);
          return jsi::Object::createFromHostObject(
              runtime, std::make_shared<JsiSkShader>(context, shader));
        });
  };

  /**
    Returns the underlying object from a host object of this type
   */
  static sk_sp<SkImage> fromValue(jsi::Runtime &runtime,
                                  const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkImage>(runtime)
        .get()
        ->getObject();
  }

  /**
   * Creates the function for construction a new instance of the SkImage
   * wrapper
   * @param context Platform context
   * @return A function for creating a new host object wrapper for the SkImage
   * class
   */
  static const jsi::HostFunctionType createCtor(RNSkPlatformContext *context) {
    return JSI_FUNC_SIGNATURE {
      auto jsiLocalUri = arguments[0].asString(runtime);
      auto localUri = jsiLocalUri.utf8(runtime);

      // Return a promise to Javascript that will be resolved when
      // the image file has been successfully loaded.
      return react::createPromiseAsJSIValue(
          runtime,
          [context, localUri](jsi::Runtime &runtime,
                              std::shared_ptr<react::Promise> promise) -> void {
            // Create a stream operation - this will be run in a
            // separate thread
            context->performStreamOperation(
                localUri,
                [&runtime, context, promise,
                 localUri](std::unique_ptr<SkStream> stream) -> void {
                  auto codec = SkCodec::MakeFromStream(std::move(stream));
                  if (codec == nullptr) {
                    context->runOnJavascriptThread(
                        [&runtime, context, promise, localUri]() {
                          promise->reject("Could not load image");
                        });
                    return;
                  }

                  auto result = codec->getImage();
                  if (std::get<1>(result) != SkCodec::Result::kSuccess) {
                    context->runOnJavascriptThread(
                        [&runtime, context, promise, localUri]() {
                          promise->reject("Could not decode image");
                        });
                    return;
                  }

                  sk_sp<SkImage> image = std::get<0>(result);

                  // Schedule callback on the Javascript thread
                  context->runOnJavascriptThread(
                      [&runtime, context, promise, localUri, image]() {
                        if (image == nullptr) {
                          promise->reject("Could not decode image");
                        }
                        promise->resolve(jsi::Object::createFromHostObject(
                            runtime, std::make_shared<JsiSkImage>(
                                         context, image, localUri)));
                      });
                });
          });
    };
  }

private:
  std::string _localUri;
};
} // namespace RNSkia
