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
  // TODO-API: Properties?
  JSI_HOST_FUNCTION(width) { return static_cast<double>(getObject()->width()); }
  JSI_HOST_FUNCTION(height) {
    return static_cast<double>(getObject()->height());
  }

  JSI_HOST_FUNCTION(makeShaderOptions) {
    auto tmx = (SkTileMode)arguments[0].asNumber();
    auto tmy = (SkTileMode)arguments[1].asNumber();
    auto fm = (SkFilterMode)arguments[2].asNumber();
    auto mm = (SkMipmapMode)arguments[3].asNumber();
    auto m = count > 4 ? JsiSkMatrix::fromValue(runtime, arguments[4]).get()
                       : nullptr;
    auto shader =
        getObject()->makeShader(tmx, tmy, SkSamplingOptions(fm, mm), m);
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkShader>(getContext(), shader));
  }

  JSI_HOST_FUNCTION(makeShaderCubic) {
    auto tmx = (SkTileMode)arguments[0].asNumber();
    auto tmy = (SkTileMode)arguments[1].asNumber();
    auto B = (float)arguments[2].asNumber();
    auto C = (float)arguments[3].asNumber();
    auto m = count > 4 ? JsiSkMatrix::fromValue(runtime, arguments[4]).get()
                       : nullptr;
    auto shader =
        getObject()->makeShader(tmx, tmy, SkSamplingOptions({B, C}), m);
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkShader>(getContext(), shader));
  }

  JSI_PROPERTY_GET(uri) {
    return jsi::String::createFromUtf8(runtime, _localUri.c_str());
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkImage, width),
                       JSI_EXPORT_FUNC(JsiSkImage, height),
                       JSI_EXPORT_FUNC(JsiSkImage, makeShaderOptions),
                       JSI_EXPORT_FUNC(JsiSkImage, makeShaderCubic))

  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiSkImage, uri))

  JsiSkImage(RNSkPlatformContext *context, const sk_sp<SkImage> image,
             const std::string &localUri)
      : JsiSkWrappingSkPtrHostObject<SkImage>(context, image),
        _localUri(localUri){};

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
    return JSI_HOST_FUNCTION_LAMBDA {
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

                  // Schedule drawCallback on the Javascript thread
                  context->runOnJavascriptThread([&runtime, context, promise,
                                                  localUri, image]() {
                    if (image == nullptr) {
                      promise->reject("Could not decode image");
                    }
                    promise->resolve(jsi::Object::createFromHostObject(
                        runtime, std::make_shared<JsiSkImage>(context, image,
                                                              localUri)));
                  });
                });
          });
    };
  }

private:
  std::string _localUri;
};
} // namespace RNSkia
