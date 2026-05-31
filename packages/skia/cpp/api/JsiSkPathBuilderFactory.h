#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiSkPathBuilder.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkPath.h"
#include "include/core/SkPathBuilder.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkPathBuilderFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(Make) {
    auto hostObjectInstance =
        std::make_shared<JsiSkPathBuilder>(getContext(), SkPathBuilder());
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(MakeFromPath) {
    auto path = JsiSkPath::fromValue(runtime, arguments[0]);
    auto hostObjectInstance =
        std::make_shared<JsiSkPathBuilder>(getContext(), SkPathBuilder(*path));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  size_t getMemoryPressure() const override { return 1024; }

  std::string getObjectType() const override {
    return "JsiSkPathBuilderFactory";
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkPathBuilderFactory, Make),
                       JSI_EXPORT_FUNC(JsiSkPathBuilderFactory, MakeFromPath))

  explicit JsiSkPathBuilderFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
