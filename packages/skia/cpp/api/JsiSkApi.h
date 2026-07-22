#pragma once

#include <memory>

#include "rnskia/RNSkPlatformContext.h"

#include "JsiSkNativeObjects.h"

#ifdef SK_GRAPHITE
#include "rnskia/RNDawnContext.h"
#include "rnwgpu/api/GPUDevice.h"
#include "rnwgpu/async/RuntimeContext.h"
#endif

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
#include "JsiSkPathBuilder.h"
#include "JsiSkPathBuilderFactory.h"
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
#include "api/recorder/JsiRecorder.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkApi : public JsiSkNativeObject<JsiSkApi> {
public:
  static constexpr const char *CLASS_NAME = "Api";

  size_t getMemoryPressure() override { return 8192; }

  /**
   * Constructs the Skia Api object that can be installed into a runtime
   * and provide functions for accessing and creating the Skia wrapper objects
   * @param context Platform context
   */
  explicit JsiSkApi(const std::shared_ptr<RNSkPlatformContext> &context)
      : JsiSkNativeObject<JsiSkApi>(context),
        _svgFactory(std::make_shared<JsiSkSVGFactory>(context)),
        _imageFactory(std::make_shared<JsiSkImageFactory>(context)),
        _animatedImageFactory(
            std::make_shared<JsiSkAnimatedImageFactory>(context)),
        _typefaceFactory(std::make_shared<JsiSkTypefaceFactory>(context)),
        _dataFactory(std::make_shared<JsiSkDataFactory>(context)),
        _imageFilterFactory(std::make_shared<JsiSkImageFilterFactory>(context)),
        _pathEffectFactory(std::make_shared<JsiSkPathEffectFactory>(context)),
        _pathFactory(std::make_shared<JsiSkPathFactory>(context)),
        _pathBuilderFactory(std::make_shared<JsiSkPathBuilderFactory>(context)),
        _colorFilterFactory(std::make_shared<JsiSkColorFilterFactory>(context)),
        _maskFilterFactory(std::make_shared<JsiSkMaskFilterFactory>(context)),
        _runtimeEffectFactory(
            std::make_shared<JsiSkRuntimeEffectFactory>(context)),
        _shaderFactory(std::make_shared<JsiSkShaderFactory>(context)),
        _textBlobFactory(std::make_shared<JsiSkTextBlobFactory>(context)),
        _surfaceFactory(std::make_shared<JsiSkSurfaceFactory>(context)),
        _pictureFactory(std::make_shared<JsiSkPictureFactory>(context)),
        _fontMgrFactory(std::make_shared<JsiSkFontMgrFactory>(context)),
        _skottieFactory(std::make_shared<JsiSkottieFactory>(context)),
        _typefaceFontProviderFactory(
            std::make_shared<JsiSkTypefaceFontProviderFactory>(context)),
        _paragraphBuilderFactory(
            std::make_shared<JsiSkParagraphBuilderFactory>(context)),
        _nativeBufferFactory(
            std::make_shared<JsiNativeBufferFactory>(context)) {
    // We create the system font manager eagerly since it has proven to be too
    // slow to do it on demand
    JsiSkFontMgrFactory::getFontMgr(getContext());
  }

  // Constructor functions: each delegates to the class's createCtor host
  // function using the platform context resolved from native state, so the
  // prototype stays context-free and can be installed on any runtime.
  JSI_HOST_FUNCTION(Video) {
    return JsiVideo::createCtor(getContext())(runtime, thisValue, arguments,
                                              count);
  }
  JSI_HOST_FUNCTION(Context) {
    return JsiSkiaContext::createCtor(getContext())(runtime, thisValue,
                                                    arguments, count);
  }
  JSI_HOST_FUNCTION(Font) {
    return JsiSkFont::createCtor(getContext())(runtime, thisValue, arguments,
                                               count);
  }
  JSI_HOST_FUNCTION(Paint) {
    return JsiSkPaint::createCtor(getContext())(runtime, thisValue, arguments,
                                                count);
  }
  JSI_HOST_FUNCTION(RSXform) {
    return JsiSkRSXform::createCtor(getContext())(runtime, thisValue, arguments,
                                                  count);
  }
  JSI_HOST_FUNCTION(RSXformFromRadians) {
    return JsiSkRSXform::createCtorFromRadians(getContext())(runtime, thisValue,
                                                             arguments, count);
  }
  JSI_HOST_FUNCTION(Matrix) {
    return JsiSkMatrix::createCtor(getContext())(runtime, thisValue, arguments,
                                                 count);
  }
  JSI_HOST_FUNCTION(XYWHRect) {
    return JsiSkRect::createCtor(getContext())(runtime, thisValue, arguments,
                                               count);
  }
  JSI_HOST_FUNCTION(RRectXY) {
    return JsiSkRRect::createCtor(getContext())(runtime, thisValue, arguments,
                                                count);
  }
  JSI_HOST_FUNCTION(Point) {
    return JsiSkPoint::createCtor(getContext())(runtime, thisValue, arguments,
                                                count);
  }
  JSI_HOST_FUNCTION(RuntimeShaderBuilder) {
    return JsiSkRuntimeShaderBuilder::createCtor(getContext())(
        runtime, thisValue, arguments, count);
  }
  JSI_HOST_FUNCTION(ContourMeasureIter) {
    return JsiSkContourMeasureIter::createCtor(getContext())(runtime, thisValue,
                                                             arguments, count);
  }
  JSI_HOST_FUNCTION(MakeVertices) {
    return JsiSkVertices::createCtor(getContext())(runtime, thisValue,
                                                   arguments, count);
  }
  JSI_HOST_FUNCTION(PictureRecorder) {
    return JsiSkPictureRecorder::createCtor(getContext())(runtime, thisValue,
                                                          arguments, count);
  }
  JSI_HOST_FUNCTION(Color) {
    return JsiSkColor::createCtor()(runtime, thisValue, arguments, count);
  }
  JSI_HOST_FUNCTION(Recorder) {
    return JsiRecorder::createCtor(getContext())(runtime, thisValue, arguments,
                                                 count);
  }

  JSI_HOST_FUNCTION(hasDevice) {
#ifdef SK_GRAPHITE
    return jsi::Value(true);
#else
    return jsi::Value(false);
#endif
  }

  JSI_HOST_FUNCTION(getDevice) {
#ifdef SK_GRAPHITE
    auto &dawnContext = DawnContext::getInstance();
    // Per-runtime context: async ops on this device resolve on the calling
    // runtime's own thread (via its ProcessEvents pump).
    auto context = rnwgpu::async::RuntimeContext::getOrCreate(
        runtime, dawnContext.getWGPUInstance());
    auto device = std::make_shared<rnwgpu::GPUDevice>(
        dawnContext.getWGPUDevice(), context, "Skia Device");
    return rnwgpu::GPUDevice::create(runtime, device);
#else
    throw jsi::JSError(runtime,
                       "getDevice() is only available with the Graphite "
                       "backend. Rebuild with SK_GRAPHITE enabled.");
#endif
  }

  // Factory properties: like the legacy HostObject implementation, each
  // property access returns a fresh JS wrapper around the shared factory
  // instance.
  JSI_PROPERTY_GET(SVG) { return makeJsiObject(runtime, _svgFactory); }
  JSI_PROPERTY_GET(Image) { return makeJsiObject(runtime, _imageFactory); }
  JSI_PROPERTY_GET(AnimatedImage) {
    return makeJsiObject(runtime, _animatedImageFactory);
  }
  JSI_PROPERTY_GET(Typeface) {
    return makeJsiObject(runtime, _typefaceFactory);
  }
  JSI_PROPERTY_GET(Data) { return makeJsiObject(runtime, _dataFactory); }
  JSI_PROPERTY_GET(ImageFilter) {
    return makeJsiObject(runtime, _imageFilterFactory);
  }
  JSI_PROPERTY_GET(PathEffect) {
    return makeJsiObject(runtime, _pathEffectFactory);
  }
  JSI_PROPERTY_GET(Path) { return makeJsiObject(runtime, _pathFactory); }
  JSI_PROPERTY_GET(PathBuilder) {
    return makeJsiObject(runtime, _pathBuilderFactory);
  }
  JSI_PROPERTY_GET(ColorFilter) {
    return makeJsiObject(runtime, _colorFilterFactory);
  }
  JSI_PROPERTY_GET(MaskFilter) {
    return makeJsiObject(runtime, _maskFilterFactory);
  }
  JSI_PROPERTY_GET(RuntimeEffect) {
    return makeJsiObject(runtime, _runtimeEffectFactory);
  }
  JSI_PROPERTY_GET(Shader) { return makeJsiObject(runtime, _shaderFactory); }
  JSI_PROPERTY_GET(TextBlob) {
    return makeJsiObject(runtime, _textBlobFactory);
  }
  JSI_PROPERTY_GET(Surface) { return makeJsiObject(runtime, _surfaceFactory); }
  JSI_PROPERTY_GET(Picture) { return makeJsiObject(runtime, _pictureFactory); }
  JSI_PROPERTY_GET(FontMgr) { return makeJsiObject(runtime, _fontMgrFactory); }
  JSI_PROPERTY_GET(Skottie) { return makeJsiObject(runtime, _skottieFactory); }
  JSI_PROPERTY_GET(TypefaceFontProvider) {
    return makeJsiObject(runtime, _typefaceFontProviderFactory);
  }
  JSI_PROPERTY_GET(ParagraphBuilder) {
    return makeJsiObject(runtime, _paragraphBuilderFactory);
  }
  JSI_PROPERTY_GET(NativeBuffer) {
    return makeJsiObject(runtime, _nativeBufferFactory);
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installHostMethod(runtime, prototype, "Video", &JsiSkApi::Video);
    installHostMethod(runtime, prototype, "Context", &JsiSkApi::Context);
    installHostMethod(runtime, prototype, "Font", &JsiSkApi::Font);
    installHostMethod(runtime, prototype, "Paint", &JsiSkApi::Paint);
    installHostMethod(runtime, prototype, "RSXform", &JsiSkApi::RSXform);
    installHostMethod(runtime, prototype, "RSXformFromRadians",
                      &JsiSkApi::RSXformFromRadians);
    installHostMethod(runtime, prototype, "Matrix", &JsiSkApi::Matrix);
    installHostMethod(runtime, prototype, "XYWHRect", &JsiSkApi::XYWHRect);
    installHostMethod(runtime, prototype, "RRectXY", &JsiSkApi::RRectXY);
    installHostMethod(runtime, prototype, "Point", &JsiSkApi::Point);
    installHostMethod(runtime, prototype, "RuntimeShaderBuilder",
                      &JsiSkApi::RuntimeShaderBuilder);
    installHostMethod(runtime, prototype, "ContourMeasureIter",
                      &JsiSkApi::ContourMeasureIter);
    installHostMethod(runtime, prototype, "MakeVertices",
                      &JsiSkApi::MakeVertices);
    installHostMethod(runtime, prototype, "PictureRecorder",
                      &JsiSkApi::PictureRecorder);
    installHostMethod(runtime, prototype, "Color", &JsiSkApi::Color);
    installHostMethod(runtime, prototype, "Recorder", &JsiSkApi::Recorder);
    installHostMethod(runtime, prototype, "hasDevice", &JsiSkApi::hasDevice);
    installHostMethod(runtime, prototype, "getDevice", &JsiSkApi::getDevice);
    installHostGetter(runtime, prototype, "SVG", &JsiSkApi::get_SVG);
    installHostGetter(runtime, prototype, "Image", &JsiSkApi::get_Image);
    installHostGetter(runtime, prototype, "AnimatedImage",
                      &JsiSkApi::get_AnimatedImage);
    installHostGetter(runtime, prototype, "Typeface", &JsiSkApi::get_Typeface);
    installHostGetter(runtime, prototype, "Data", &JsiSkApi::get_Data);
    installHostGetter(runtime, prototype, "ImageFilter",
                      &JsiSkApi::get_ImageFilter);
    installHostGetter(runtime, prototype, "PathEffect",
                      &JsiSkApi::get_PathEffect);
    installHostGetter(runtime, prototype, "Path", &JsiSkApi::get_Path);
    installHostGetter(runtime, prototype, "PathBuilder",
                      &JsiSkApi::get_PathBuilder);
    installHostGetter(runtime, prototype, "ColorFilter",
                      &JsiSkApi::get_ColorFilter);
    installHostGetter(runtime, prototype, "MaskFilter",
                      &JsiSkApi::get_MaskFilter);
    installHostGetter(runtime, prototype, "RuntimeEffect",
                      &JsiSkApi::get_RuntimeEffect);
    installHostGetter(runtime, prototype, "Shader", &JsiSkApi::get_Shader);
    installHostGetter(runtime, prototype, "TextBlob", &JsiSkApi::get_TextBlob);
    installHostGetter(runtime, prototype, "Surface", &JsiSkApi::get_Surface);
    installHostGetter(runtime, prototype, "Picture", &JsiSkApi::get_Picture);
    installHostGetter(runtime, prototype, "FontMgr", &JsiSkApi::get_FontMgr);
    installHostGetter(runtime, prototype, "Skottie", &JsiSkApi::get_Skottie);
    installHostGetter(runtime, prototype, "TypefaceFontProvider",
                      &JsiSkApi::get_TypefaceFontProvider);
    installHostGetter(runtime, prototype, "ParagraphBuilder",
                      &JsiSkApi::get_ParagraphBuilder);
    installHostGetter(runtime, prototype, "NativeBuffer",
                      &JsiSkApi::get_NativeBuffer);
  }

private:
  std::shared_ptr<JsiSkSVGFactory> _svgFactory;
  std::shared_ptr<JsiSkImageFactory> _imageFactory;
  std::shared_ptr<JsiSkAnimatedImageFactory> _animatedImageFactory;
  std::shared_ptr<JsiSkTypefaceFactory> _typefaceFactory;
  std::shared_ptr<JsiSkDataFactory> _dataFactory;
  std::shared_ptr<JsiSkImageFilterFactory> _imageFilterFactory;
  std::shared_ptr<JsiSkPathEffectFactory> _pathEffectFactory;
  std::shared_ptr<JsiSkPathFactory> _pathFactory;
  std::shared_ptr<JsiSkPathBuilderFactory> _pathBuilderFactory;
  std::shared_ptr<JsiSkColorFilterFactory> _colorFilterFactory;
  std::shared_ptr<JsiSkMaskFilterFactory> _maskFilterFactory;
  std::shared_ptr<JsiSkRuntimeEffectFactory> _runtimeEffectFactory;
  std::shared_ptr<JsiSkShaderFactory> _shaderFactory;
  std::shared_ptr<JsiSkTextBlobFactory> _textBlobFactory;
  std::shared_ptr<JsiSkSurfaceFactory> _surfaceFactory;
  std::shared_ptr<JsiSkPictureFactory> _pictureFactory;
  std::shared_ptr<JsiSkFontMgrFactory> _fontMgrFactory;
  std::shared_ptr<JsiSkottieFactory> _skottieFactory;
  std::shared_ptr<JsiSkTypefaceFontProviderFactory>
      _typefaceFontProviderFactory;
  std::shared_ptr<JsiSkParagraphBuilderFactory> _paragraphBuilderFactory;
  std::shared_ptr<JsiNativeBufferFactory> _nativeBufferFactory;
};
} // namespace RNSkia
