#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkData.h"
#include "JsiSkNativeObjects.h"
#include "JsiSkTypeface.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkTypefaceFactory : public JsiSkNativeObject<JsiSkTypefaceFactory> {
public:
  static constexpr const char *CLASS_NAME = "TypefaceFactory";

  JSI_HOST_FUNCTION(MakeFreeTypeFaceFromData) {
    auto data = JsiSkData::fromValue(runtime, arguments[0]);
    auto fontMgr = JsiSkFontMgrFactory::getFontMgr(getContext());
    auto typeface = fontMgr->makeFromData(std::move(data));
    if (typeface == nullptr) {
      return jsi::Value::null();
    }
    return makeJsiObject(runtime, std::make_shared<JsiSkTypeface>(
                                      getContext(), std::move(typeface)));
  }

  size_t getMemoryPressure() override { return 1024; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installHostMethod(runtime, prototype, "MakeFreeTypeFaceFromData",
                      &JsiSkTypefaceFactory::MakeFreeTypeFaceFromData);
  }

  explicit JsiSkTypefaceFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkNativeObject<JsiSkTypefaceFactory>(std::move(context)) {}
};

} // namespace RNSkia
