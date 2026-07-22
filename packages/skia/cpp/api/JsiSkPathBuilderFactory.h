#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiSkNativeObjects.h"
#include "JsiSkPathBuilder.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkPath.h"
#include "include/core/SkPathBuilder.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkPathBuilderFactory
    : public JsiSkNativeObject<JsiSkPathBuilderFactory> {
public:
  static constexpr const char *CLASS_NAME = "PathBuilderFactory";

  JSI_HOST_FUNCTION(Make) {
    return makeJsiObject(runtime, std::make_shared<JsiSkPathBuilder>(
                                      getContext(), SkPathBuilder()));
  }

  JSI_HOST_FUNCTION(MakeFromPath) {
    auto path = JsiSkPath::fromValue(runtime, arguments[0]);
    return makeJsiObject(runtime, std::make_shared<JsiSkPathBuilder>(
                                      getContext(), SkPathBuilder(*path)));
  }

  size_t getMemoryPressure() override { return 1024; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "Make",
                      &JsiSkPathBuilderFactory::Make);
    installHostMethod(runtime, prototype, "MakeFromPath",
                      &JsiSkPathBuilderFactory::MakeFromPath);
  }

  explicit JsiSkPathBuilderFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkNativeObject<JsiSkPathBuilderFactory>(std::move(context)) {}
};

} // namespace RNSkia
