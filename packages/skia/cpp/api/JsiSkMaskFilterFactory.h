#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkColorFilter.h"
#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkMaskFilter.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkMaskFilterFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakeBlur) {
    int blurStyle = arguments[0].asNumber();
    float sigma = arguments[1].asNumber();
    bool respectCTM = arguments[2].getBool();
    auto maskFilter = std::make_shared<JsiSkMaskFilter>(
        getContext(),
        SkMaskFilter::MakeBlur((SkBlurStyle)blurStyle, sigma, respectCTM));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, maskFilter,
                                                       getContext());
  }

  size_t getMemoryPressure() const override { return 1024; }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkMaskFilterFactory, MakeBlur))

  explicit JsiSkMaskFilterFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
