#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"

#include <JsiSkSurface.h>
#if defined(__ANDROID_API__)
#include "SkiaOpenGLRenderer.h"
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
    auto width = static_cast<int>(arguments[1].asNumber());
    auto height = static_cast<int>(arguments[2].asNumber());
    auto context = getContext();
#if defined(__ANDROID_API__)
    auto renderer = std::make_shared<SkiaOpenGLRenderer>();
    renderer->run(
        [&context, &runtime, &fn](SkCanvas *canvas) {
          auto jsiCanvas = jsi::Object::createFromHostObject(
              runtime, std::make_shared<JsiSkCanvas>(context, canvas));
          fn.call(runtime, jsiCanvas);
        },
        width, height);
    auto surface = renderer->getSurface();
#else
    auto surface = SkSurface::MakeRasterN32Premul(width, height);
    auto canvas = surface->getCanvas();
    if (surface == nullptr) {
      return jsi::Value::null();
    }
    auto jsiCanvas = jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkCanvas>(context, canvas));
    fn.call(runtime, jsiCanvas);
#endif
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
