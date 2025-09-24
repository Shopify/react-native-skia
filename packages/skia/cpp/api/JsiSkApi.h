#pragma once

#include <memory>

#include "RNSkPlatformContext.h"

#include "JsiSkHostObjects.h"
#include "JsiSkThreadSafeDeletion.h"

#include "JsiNativeBuffer.h"
#include "JsiSkAnimatedImage.h"
#include "JsiSkAnimatedImageFactory.h"
#include "JsiSkColor.h"
#include "JsiSkColorFilter.h"
#include "JsiSkColorFilterFactory.h"
#include "JsiSkContourMeasureIter.h"
#include "JsiSkDataFactory.h"
#include "JsiSkFont.h"
#include "JsiSkFontMgr.h"
#include "JsiSkFontMgrFactory.h"
#include "JsiSkImage.h"
#include "JsiSkImageFactory.h"
#include "JsiSkImageFilter.h"
#include "JsiSkImageFilterFactory.h"
#include "JsiSkMaskFilter.h"
#include "JsiSkMaskFilterFactory.h"
#include "JsiSkMatrix.h"
#include "JsiSkPaint.h"
#include "JsiSkParagraphBuilder.h"
#include "JsiSkParagraphBuilderFactory.h"
#include "JsiSkPath.h"
#include "JsiSkPathEffect.h"
#include "JsiSkPathEffectFactory.h"
#include "JsiSkPathFactory.h"
#include "JsiSkPictureFactory.h"
#include "JsiSkPictureRecorder.h"
#include "JsiSkPoint.h"
#include "JsiSkRRect.h"
#include "JsiSkRSXform.h"
#include "JsiSkRect.h"
#include "JsiSkRuntimeEffect.h"
#include "JsiSkRuntimeEffectFactory.h"
#include "JsiSkRuntimeShaderBuilder.h"
#include "JsiSkSVG.h"
#include "JsiSkSVGFactory.h"
#include "JsiSkShader.h"
#include "JsiSkShaderFactory.h"
#include "JsiSkSurfaceFactory.h"
#include "JsiSkTextBlobFactory.h"
#include "JsiSkTypeface.h"
#include "JsiSkTypefaceFactory.h"
#include "JsiSkTypefaceFontProviderFactory.h"
#include "JsiSkVertices.h"
#include "JsiSkiaContext.h"
#include "JsiSkottieFactory.h"
#include "JsiVideo.h"
#include "recorder/JsiRecorder.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkApi : public JsiSkHostObject {
private:
  /**
   * Creates a function that drains the thread-safe deletion queue for all object types
   */
  std::function<jsi::Value(jsi::Runtime &, const jsi::Value &, const jsi::Value *, size_t)>
  makeDrainDeletionQueueFunction() {
    return [](jsi::Runtime &runtime, const jsi::Value &thisValue, const jsi::Value *arguments, size_t count) -> jsi::Value {
      // Drain deletion queues for all Skia object types that use ThreadSafeDeletion
      ThreadSafeDeletion<SkImage>::drainDeletionQueue();
      ThreadSafeDeletion<SkSurface>::drainDeletionQueue();
      return jsi::Value::undefined();
    };
  }

  /**
   * Creates a function that returns the total number of pending deletions across all object types
   */
  std::function<jsi::Value(jsi::Runtime &, const jsi::Value &, const jsi::Value *, size_t)>
  makeGetPendingDeletionCountFunction() {
    return [](jsi::Runtime &runtime, const jsi::Value &thisValue, const jsi::Value *arguments, size_t count) -> jsi::Value {
      size_t totalCount = ThreadSafeDeletion<SkImage>::getPendingDeletionCount() +
                         ThreadSafeDeletion<SkSurface>::getPendingDeletionCount();
      return jsi::Value(static_cast<double>(totalCount));
    };
  }

public:
  size_t getMemoryPressure() const override { return 8192; }

  /**
   * Constructs the Skia Api object that can be installed into a runtime
   * and provide functions for accessing and creating the Skia wrapper objects
   * @param context Platform context
   */
  explicit JsiSkApi(const std::shared_ptr<RNSkPlatformContext> &context)
      : JsiSkHostObject(context) {
    // We create the system font manager eagerly since it has proven to be too
    // slow to do it on demand
    JsiSkFontMgrFactory::getFontMgr(getContext());
    installFunction("Video", JsiVideo::createCtor(context));
    installFunction("Context", JsiSkiaContext::createCtor(context));
    installFunction("Font", JsiSkFont::createCtor(context));
    installFunction("Paint", JsiSkPaint::createCtor(context));
    installFunction("RSXform", JsiSkRSXform::createCtor(context));
    installFunction("RSXformFromRadians",
                    JsiSkRSXform::createCtorFromRadians(context));
    installFunction("Matrix", JsiSkMatrix::createCtor(context));
    installFunction("XYWHRect", JsiSkRect::createCtor(context));
    installFunction("RRectXY", JsiSkRRect::createCtor(context));
    installFunction("Point", JsiSkPoint::createCtor(context));
    installFunction("RuntimeShaderBuilder",
                    JsiSkRuntimeShaderBuilder::createCtor(context));
    installFunction("ContourMeasureIter",
                    JsiSkContourMeasureIter::createCtor(context));
    installFunction("MakeVertices", JsiSkVertices::createCtor(context));
    installFunction("PictureRecorder",
                    JsiSkPictureRecorder::createCtor(context));
    installFunction("Color", JsiSkColor::createCtor());

    installReadonlyProperty("SVG", std::make_shared<JsiSkSVGFactory>(context));
    installReadonlyProperty("Image",
                            std::make_shared<JsiSkImageFactory>(context));
    installReadonlyProperty(
        "AnimatedImage", std::make_shared<JsiSkAnimatedImageFactory>(context));
    installReadonlyProperty("Typeface",
                            std::make_shared<JsiSkTypefaceFactory>(context));
    installReadonlyProperty("Data",
                            std::make_shared<JsiSkDataFactory>(context));
    installReadonlyProperty("ImageFilter",
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
    installReadonlyProperty("TextBlob",
                            std::make_shared<JsiSkTextBlobFactory>(context));
    installReadonlyProperty("Surface",
                            std::make_shared<JsiSkSurfaceFactory>(context));
    installReadonlyProperty("Picture",
                            std::make_shared<JsiSkPictureFactory>(context));
    installReadonlyProperty("FontMgr",
                            std::make_shared<JsiSkFontMgrFactory>(context));
    installReadonlyProperty("Skottie",
                            std::make_shared<JsiSkottieFactory>(context));
    installReadonlyProperty(
        "TypefaceFontProvider",
        std::make_shared<JsiSkTypefaceFontProviderFactory>(context));

    installReadonlyProperty(
        "ParagraphBuilder",
        std::make_shared<JsiSkParagraphBuilderFactory>(context));

    installReadonlyProperty("NativeBuffer",
                            std::make_shared<JsiNativeBufferFactory>(context));

    installFunction("Recorder", JsiRecorder::createCtor(context));

    // Install thread-safe deletion management functions
    installFunction("drainDeletionQueue", makeDrainDeletionQueueFunction());
    installFunction("getPendingDeletionCount", makeGetPendingDeletionCountFunction());
  }
};
} // namespace RNSkia
