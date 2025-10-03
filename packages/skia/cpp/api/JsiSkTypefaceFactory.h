#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkData.h"
#include "JsiSkHostObjects.h"
#include "JsiSkTypeface.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkTypefaceFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakeFreeTypeFaceFromData) {
    auto data = JsiSkData::fromValue(runtime, arguments[0]);
    auto fontMgr = JsiSkFontMgrFactory::getFontMgr(getContext());
    auto typeface = fontMgr->makeFromData(std::move(data));
    if (typeface == nullptr) {
      return jsi::Value::null();
    }
    auto hostObjectInstance =
        std::make_shared<JsiSkTypeface>(getContext(), std::move(typeface));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  size_t getMemoryPressure() const override { return 1024; }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkTypefaceFactory,
                                       MakeFreeTypeFaceFromData))

  explicit JsiSkTypefaceFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
