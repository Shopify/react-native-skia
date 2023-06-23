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

	  if (!arguments[0].isObject()) {
		throw jsi::JSError(runtime, "Expected array as parameter");
	  }
		
	  auto jsArray = arguments[0].asObject(runtime).asArray(runtime);
	  auto size = jsArray.length(runtime);

	  // Prepare data for SkFontMgr_New_Custom_Data
	  std::unique_ptr<sk_sp<SkData>[]> skdatas(new sk_sp<SkData>[size]);
	  for (int i = 0; i < size; ++i) {
		auto element = jsArray.getValueAtIndex(runtime, i);
		
		// Get the SkData instance from the JavaScript array element
		sk_sp<SkData> data = JsiSkData::fromValue(runtime, element);
		
		// Populate each skdata
		skdatas[i] = std::move(data);
	  }

	  // Create font manager
	  sk_sp<SkFontMgr> fontManager = SkFontMgr_New_Custom_Data(SkSpan(skdatas.get(), size));

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
