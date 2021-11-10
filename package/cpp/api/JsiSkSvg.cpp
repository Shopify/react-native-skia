#include "JsiSkSvg.h"
#include <ReactCommon/TurboModuleUtils.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkStream.h>

#pragma clang diagnostic pop

namespace RNSkia {
using namespace facebook;

JsiSkSvgStatic::JsiSkSvgStatic(RNSkPlatformContext *context)
    : JsiSkHostObject(context) {
  installFunction(
      "fromLocalUri", JSI_FUNC_SIGNATURE {
        auto jsiLocalUri = arguments[0].asString(runtime);
        auto localUri = jsiLocalUri.utf8(runtime);

        // Return a promise to Javascript that will be resolved when
        // the svg file has been successfully loaded.
        return react::createPromiseAsJSIValue(
            runtime,
            [context, localUri](jsi::Runtime &runtime,
                                std::shared_ptr<react::Promise> promise) {
              context->performStreamOperation(
                  localUri,
                  [&runtime, promise,
                   context](std::unique_ptr<SkStream> stream) -> void {
                    sk_sp<SkSVGDOM> svg_dom = SkSVGDOM::Builder().make(*stream);

                    // Schedule callback on the Javascript thread
                    context->runOnJavascriptThread(
                        [&runtime, promise, context, svg_dom]() {
                          if (svg_dom == nullptr) {
                            promise->reject("Could not load svg from uri.");
                            return;
                          }
                          promise->resolve(jsi::Object::createFromHostObject(
                              runtime,
                              std::make_shared<JsiSkSvg>(context, svg_dom)));
                        });
                  });
            });
      });

  installFunction(
      "fromString", JSI_FUNC_SIGNATURE {
        auto svgText = arguments[0].asString(runtime).utf8(runtime);
        auto stream =
            SkMemoryStream::MakeDirect(svgText.c_str(), svgText.size());
        auto svg_dom = SkSVGDOM::Builder().make(*stream);
        return jsi::Object::createFromHostObject(
            runtime, std::make_shared<JsiSkSvg>(context, svg_dom));
      });
}

} // namespace RNSkia
