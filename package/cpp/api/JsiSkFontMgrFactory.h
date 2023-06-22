#pragma once

#include <memory>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkFontMgr.h"
#include "include/ports/SkFontMgr_data.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkFontMgrFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(FromData) {
	auto context = getContext();
    // Prepare data for SkFontMgr_New_Custom_Data
    std::unique_ptr<sk_sp<SkData>[]> skdatas(new sk_sp<SkData>[count]);
    for (int i = 0; i < count; ++i) {
      if (!arguments[i].isObject()) {
        throw jsi::JSError(runtime, "Expected arraybuffer as parameter");
      }

      auto array = arguments[i].asObject(runtime);
      jsi::ArrayBuffer buffer =
          array
              .getProperty(runtime,
                           jsi::PropNameID::forAscii(runtime, "buffer"))
              .asObject(runtime)
              .getArrayBuffer(runtime);

      sk_sp<SkData> data =
          SkData::MakeWithCopy(buffer.data(runtime), buffer.size(runtime));

      // Populate each skdata
      skdatas[i] = std::move(data);
    }

    // Create font manager
    sk_sp<SkFontMgr> fontManager = SkFontMgr_New_Custom_Data(SkSpan(skdatas.get(), count));
	    
    // Return JSI wrapper for the font manager
    // This assumes a corresponding JsiSkFontMgr host object exists
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkFontMgr>(std::move(context), fontManager));
  }

  JSI_HOST_FUNCTION(System) {
    auto context = getContext();
    static SkOnce once;
    static sk_sp<SkFontMgr> fontMgr;
    once([&context, &runtime] { fontMgr = context->getFontMgr(); });
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkFontMgr>(std::move(context), fontMgr));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkFontMgrFactory, FromData),
                       JSI_EXPORT_FUNC(JsiSkFontMgrFactory, System))

  explicit JsiSkFontMgrFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
