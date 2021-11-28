#pragma once

#include <JsiSkHostObjects.h>
#include <ReactCommon/TurboModuleUtils.h>
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <modules/svg/include/SkSVGDOM.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkSvg : public JsiSkWrappingSkPtrHostObject<SkSVGDOM> {
public:
  JsiSkSvg(std::shared_ptr<RNSkPlatformContext> context, sk_sp<SkSVGDOM> svgdom)
      : JsiSkWrappingSkPtrHostObject<SkSVGDOM>(context, svgdom){};

  /**
    Returns the underlying object from a host object of this type
   */
  static sk_sp<SkSVGDOM> fromValue(jsi::Runtime &runtime,
                                   const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkSvg>(runtime)
        .get()
        ->getObject();
  }
};

class JsiSkSvgStatic : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(fromLocalUri) {
    auto jsiLocalUri = arguments[0].asString(runtime);
    auto localUri = jsiLocalUri.utf8(runtime);

    auto context = getContext();

    // Return a promise to Javascript that will be resolved when
    // the svg file has been successfully loaded.
    return react::createPromiseAsJSIValue(
        runtime, [context, localUri](jsi::Runtime &runtime,
                                     std::shared_ptr<react::Promise> promise) {
          context->performStreamOperation(
              localUri,
              [&runtime, promise,
               context](std::unique_ptr<SkStream> stream) -> void {
                sk_sp<SkSVGDOM> svg_dom = SkSVGDOM::Builder().make(*stream);

                // Schedule drawCallback on the Javascript thread
                context->runOnJavascriptThread([&runtime, promise, context,
                                                svg_dom]() {
                  if (svg_dom == nullptr) {
                    promise->reject("Could not load svg from uri.");
                    return;
                  }
                  promise->resolve(jsi::Object::createFromHostObject(
                      runtime, std::make_shared<JsiSkSvg>(context, svg_dom)));
                });
              });
        });
  }

  JSI_HOST_FUNCTION(fromString) {
    auto svgText = arguments[0].asString(runtime).utf8(runtime);
    auto stream = SkMemoryStream::MakeDirect(svgText.c_str(), svgText.size());
    auto svg_dom = SkSVGDOM::Builder().make(*stream);
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkSvg>(getContext(), svg_dom));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkSvgStatic, fromString),
                       JSI_EXPORT_FUNC(JsiSkSvgStatic, fromLocalUri))

  JsiSkSvgStatic(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(context) {}
};

} // namespace RNSkia
