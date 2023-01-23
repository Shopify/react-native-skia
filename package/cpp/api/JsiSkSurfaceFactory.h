#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"

#include <JsiSkSurface.h>
#ifdef ANDROID
#include "SkiaOpenGLRenderer.h"
#else
#include "SkiaMetalRenderer.h"
#endif

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkImage.h"
#include "SkSurface.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkSurfaceFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(Make) {
    auto width = static_cast<int>(arguments[0].asNumber());
    auto height = static_cast<int>(arguments[1].asNumber());
    auto surface = SkSurface::MakeRasterN32Premul(width, height);
    if (surface == nullptr) {
      return jsi::Value::null();
    }
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkSurface>(getContext(), std::move(surface)));
  }

  JSI_HOST_FUNCTION(drawAsImage) {
    auto fn = arguments[0].asObject(runtime).asFunction(runtime);
    // TODO: we should support float here
    auto width = static_cast<int>(arguments[1].asNumber());
    auto height = static_cast<int>(arguments[2].asNumber());
    auto context = getContext();
#ifdef ANDROID
    auto surface = MakeOffscreenGLSurface(width, height);
#else
    auto surface = MakeOffscreenMetalSurface(width, height);
#endif
    if (surface == nullptr) {
      return jsi::Value::null();
    }
    auto canvas = surface->getCanvas();
    auto jsiCanvas = jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkCanvas>(context, canvas));
    fn.call(runtime, jsiCanvas);
    auto image = surface->makeImageSnapshot();
    if (image == nullptr) {
      return jsi::Value::null();
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkSurfaceFactory, Make),
                       JSI_EXPORT_FUNC(JsiSkSurfaceFactory, drawAsImage))

  explicit JsiSkSurfaceFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
