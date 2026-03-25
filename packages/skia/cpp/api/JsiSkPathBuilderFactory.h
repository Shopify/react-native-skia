#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiSkPath.h"
#include "JsiSkPathBuilder.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkPath.h"
#include "include/core/SkPathBuilder.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

/**
 * JsiSkPathBuilderFactory exposes PathBuilder construction to JS.
 *
 * Skia.PathBuilder.Make()            -> empty PathBuilder
 * Skia.PathBuilder.MakeFromPath(p)   -> PathBuilder initialised from Path p
 */
class JsiSkPathBuilderFactory : public JsiSkHostObject {
public:
  /**
   * Make() -> PathBuilder
   * Creates an empty PathBuilder with default fill type (kWinding).
   */
  JSI_HOST_FUNCTION(Make) {
    auto instance =
        std::make_shared<JsiSkPathBuilder>(getContext(), SkPathBuilder());
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, instance,
                                                       getContext());
  }

  /**
   * MakeFromPath(path) -> PathBuilder
   * Creates a PathBuilder pre-populated with all verbs from an existing Path.
   * The fill type is copied from the source path.
   */
  JSI_HOST_FUNCTION(MakeFromPath) {
    SkPath path = JsiSkPath::pathFromValue(runtime, arguments[0]);
    auto instance = std::make_shared<JsiSkPathBuilder>(getContext(),
                                                       SkPathBuilder(path));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, instance,
                                                       getContext());
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
