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

#if defined(__ANDROID_API__)
  JSI_HOST_FUNCTION(drawAsImage) {
    auto width = static_cast<int>(arguments[1].asNumber());
    auto height = static_cast<int>(arguments[2].asNumber());
    auto renderer = std::make_shared<SkiaOpenGLRenderer>();
    renderer->run(
        [&](SkCanvas *canvas) {
          canvas->clear(SK_ColorBLUE);
          SkPaint paint;
          paint.setColor(SK_ColorRED);
          canvas->drawCircle(0, 0, 50, paint);
          // Create jsi canvas
          // auto jsiCanvas = std::make_shared<JsiSkCanvas>(_platformContext);
          // jsiCanvas->setCanvas(canvas);

          // drawInJsiCanvas(std::move(jsiCanvas),
          // canvasProvider->getScaledWidth(),
          //                 canvasProvider->getScaledHeight(), ms.count() /
          //                 1000);
        },
        width, height);

    auto image = renderer->getSurface()->makeImageSnapshot();
    if (image == nullptr) {
      return jsi::Value::null();
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
  }
#endif

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkSurfaceFactory, Make),
                       JSI_EXPORT_FUNC(JsiSkSurfaceFactory, drawAsImage))

  explicit JsiSkSurfaceFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
