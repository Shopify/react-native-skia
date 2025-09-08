#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkData.h"
#include "JsiSkHostObjects.h"
#include "JsiSkTypefaceFontProvider.h"

namespace RNSkia {

namespace jsi = facebook::jsi;
namespace para = skia::textlayout;

class JsiSkTypefaceFontProviderFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(Make) {
    auto provider = std::make_shared<JsiSkTypefaceFontProvider>(
        getContext(), sk_make_sp<para::TypefaceFontProvider>());
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, provider,
                                                       getContext());
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkTypefaceFontProviderFactory, Make))

  size_t getMemoryPressure() const override { return 2048; }

  explicit JsiSkTypefaceFontProviderFactory(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
