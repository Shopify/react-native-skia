#pragma once

#include "RNSkPlatformContext.h"

#include "JsiSkHostObjects.h"

#include "JsiSKRuntimeEffect.h"
#include "JsiSkColorFilter.h"
#include "JsiSkColorFilterFactory.h"
#include "JsiSkFont.h"
#include "JsiSkImage.h"
#include "JsiSkImageFilter.h"
#include "JsiSkImageFilterFactory.h"
#include "JsiSkMaskFilter.h"
#include "JsiSkMaskFilterFactory.h"
#include "JsiSkMatrix.h"
#include "JsiSkPaint.h"
#include "JsiSkPath.h"
#include "JsiSkPathEffect.h"
#include "JsiSkPathEffectFactory.h"
#include "JsiSkPathFactory.h"
#include "JsiSkPoint.h"
#include "JsiSkRRect.h"
#include "JsiSkRect.h"
#include "JsiSkRuntimeEffectFactory.h"
#include "JsiSkShader.h"
#include "JsiSkShaderFactory.h"
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
  JsiSkApi(jsi::Runtime &runtime, std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(context) {

    installFunction("Font", JsiSkFont::createCtor(context));
    installFunction("Image", JsiSkImage::createCtor(context));
    installFunction("Paint", JsiSkPaint::createCtor(context));
    installFunction("Matrix", JsiSkMatrix::createCtor(context));
    installFunction("XYWHRect", JsiSkRect::createCtor(context));
    installFunction("RRectXY", JsiSkRRect::createCtor(context));
    installFunction("Point", JsiSkPoint::createCtor(context));
    installFunction("Typeface", JsiSkTypeface::createCtor(context));

    // Static members
    installReadonlyProperty("ImageFilters",
                            std::make_shared<JsiSkImageFilterFactory>(context));
    installReadonlyProperty("PathEffect",
                            std::make_shared<JsiSkPathEffectFactory>(context));
    installReadonlyProperty("Path",
                            std::make_shared<JsiSkPathFactory>(context));
    installReadonlyProperty("ColorFilter",
                            std::make_shared<JsiSkColorFilterFactory>(context));
    installReadonlyProperty("MaskFilter",
                            std::make_shared<JsiSkMaskFilterFactory>(context));
    installReadonlyProperty(
        "RuntimeEffect", std::make_shared<JsiSkRuntimeEffectFactory>(context));
    installReadonlyProperty("Shader",
                            std::make_shared<JsiSkShaderFactory>(context));
    installReadonlyProperty("Svg", std::make_shared<JsiSkSvgStatic>(context));
  };
};
} // namespace RNSkia
