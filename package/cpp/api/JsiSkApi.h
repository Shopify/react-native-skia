#pragma once

#include "RNSkPlatformContext.h"

#include "JsiSkHostObjects.h"

#include "JsiSKRuntimeEffect.h"
#include "JsiSkColorFilter.h"
#include "JsiSkFont.h"
#include "JsiSkGradientShader.h"
#include "JsiSkImage.h"
#include "JsiSkImageFilter.h"
#include "JsiSkMaskFilter.h"
#include "JsiSkMatrix.h"
#include "JsiSkPaint.h"
#include "JsiSkPath.h"
#include "JsiSkRect.h"
#include "JsiSkShader.h"
#include "JsiSkSvg.h"
#include "JsiSkTypeface.h"

namespace RNSkia {

using namespace facebook;

class JsiSkApi : public JsiSkHostObject {
public:
  /**
   * Constructs the Skia Api object that can be installed into a runtime
   * and provide functions for accessing and creating the Skia wrapper objects
   * @param context Platform context
   */
  JsiSkApi(jsi::Runtime &runtime, RNSkPlatformContext *context)
      : JsiSkHostObject(context) {

    installReadonlyProperty(
        "PixelRatio", [context](jsi::Runtime &) -> jsi::Value {
          return jsi::Value(static_cast<double>(context->getPixelDensity()));
        });

    installFunction("ColorFilter", JsiSkColorFilter::createCtor(context));
    installFunction("Font", JsiSkFont::createCtor(context));
    installFunction("Image", JsiSkImage::createCtor(context));
    installFunction("MaskFilter", JsiSkMaskFilter::createCtor(context));
    installFunction("Paint", JsiSkPaint::createCtor(context));
    installFunction("Path", JsiSkPath::createCtor(context));
    installFunction("Rect", JsiSkRect::createCtor(context));
    installFunction("RuntimeEffects", JsiSkRuntimeEffect::createCtor(context));
    installFunction("Shader", JsiSkShader::createCtor(context));
    installFunction("Typeface", JsiSkTypeface::createCtor(context));
    installFunction("Matrix", JsiSkMatrix::createCtor(context));

    // Static members
    installReadonlyProperty("ImageFilters",
                            std::make_shared<JsiSkImageFilterStatic>(context));
    installReadonlyProperty(
        "GradientShader", std::make_shared<JsiSkGradientShaderStatic>(context));
    installReadonlyProperty("Svg", std::make_shared<JsiSkSvgStatic>(context));
  };
};
} // namespace RNSkia
