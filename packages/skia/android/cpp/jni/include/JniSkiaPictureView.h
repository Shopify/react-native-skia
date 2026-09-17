#pragma once

#include <cstdint>
#include <memory>
#include <vector>

#include <fbjni/fbjni.h>
#include <jni.h>

#include "JniSkiaManager.h"
#include "RNSkOpenGLCanvasProvider.h"
#include "RNSkView.h"

#include <fbjni/detail/Hybrid.h>

#if defined(SK_GRAPHITE)
#include "RNDawnContext.h"
#else
#include "OpenGLContext.h"
#endif
#include "include/core/SkCanvas.h"
#include "include/core/SkImage.h"
#include "include/core/SkPicture.h"
#include "include/core/SkSurface.h"

namespace RNSkia {
namespace jni = facebook::jni;

/**
 The native half of com.shopify.reactnative.skia.SkiaPictureView. Owns the
 RNSkView (picture + draw logic) and the canvas provider wrapping the Android
 surface, and registers the view with the RNSkManager.
 */
class JniSkiaPictureView : public jni::HybridClass<JniSkiaPictureView> {
public:
  static auto constexpr kJavaDescriptor =
      "Lcom/shopify/reactnative/skia/SkiaPictureView;";

  static jni::local_ref<jhybriddata>
  initHybrid(jni::alias_ref<jhybridobject> jThis,
             jni::alias_ref<JniSkiaManager::javaobject> skiaManager) {
    return makeCxxInstance(jThis, skiaManager);
  }

  static void registerNatives() {
    registerHybrid(
        {makeNativeMethod("initHybrid", JniSkiaPictureView::initHybrid),
         makeNativeMethod("surfaceAvailable",
                          JniSkiaPictureView::surfaceAvailable),
         makeNativeMethod("surfaceDestroyed",
                          JniSkiaPictureView::surfaceDestroyed),
         makeNativeMethod("surfaceSizeChanged",
                          JniSkiaPictureView::surfaceSizeChanged),
         makeNativeMethod("setDebugMode", JniSkiaPictureView::setDebugMode),
         makeNativeMethod("registerView", JniSkiaPictureView::registerView),
         makeNativeMethod("unregisterView", JniSkiaPictureView::unregisterView),
         makeNativeMethod("getBitmap", JniSkiaPictureView::getBitmap)});
  }

  std::shared_ptr<RNSkManager> getSkiaManager() {
    return _manager->getSkiaManager();
  }

  std::shared_ptr<RNSkView> getSkiaView() { return _view; }

private:
  void surfaceAvailable(jobject surface, int width, int height, bool opaque,
                        bool highBitDepth) {
    _canvasProvider->surfaceAvailable(surface, width, height, opaque,
                                      highBitDepth);
    _view->redraw();
  }

  void surfaceSizeChanged(jobject surface, int width, int height, bool opaque,
                          bool highBitDepth) {
    _canvasProvider->surfaceSizeChanged(surface, width, height, opaque,
                                        highBitDepth);
    // This is only need for the first time to frame, this redraw call will
    // invoke updateTexImage for the previous frame
    _view->redraw();
  }

  void surfaceDestroyed() { _canvasProvider->surfaceDestroyed(); }

  void setDebugMode(bool show) { _view->setShowDebugOverlays(show); }

  void registerView(int nativeId) {
    getSkiaManager()->registerSkiaView(nativeId, _view);
  }

  void unregisterView() {
    auto manager = getSkiaManager();
    if (manager == nullptr || _view == nullptr) {
      return;
    }
    manager->setSkiaView(_view->getNativeId(), nullptr);
    manager->unregisterSkiaView(_view->getNativeId());
  }

  /**
   Draws the current picture into an offscreen surface and returns its BGRA
   pixels. Used by the Java side to paint a warm-up frame while the surface is
   not available yet.
   */
  jni::local_ref<jni::JArrayInt> getBitmap(int width, int height) {
    sk_sp<SkPicture> picture = _view->getPicture();

    const size_t pixelCount =
        static_cast<size_t>(width) * static_cast<size_t>(height);
    if (pixelCount == 0) {
      return jni::JArrayInt::newArray(0);
    }

    sk_sp<SkSurface> surface;
#if defined(SK_GRAPHITE)
    surface = DawnContext::getInstance().MakeOffscreen(width, height);
#else
    surface = OpenGLContext::getInstance().MakeOffscreen(width, height);
#endif

    if (!surface) {
      return jni::JArrayInt::newArray(0);
    }

    SkCanvas *canvas = surface->getCanvas();
    if (canvas == nullptr) {
      return jni::JArrayInt::newArray(0);
    }

    canvas->clear(SK_ColorTRANSPARENT);

    if (picture) {
      auto pd = _view->getPlatformContext()->getPixelDensity();
      canvas->save();
      canvas->scale(pd, pd);
      canvas->drawPicture(picture);
      canvas->restore();
    }

    sk_sp<SkImage> snapshot = surface->makeImageSnapshot();
    if (!snapshot) {
      return jni::JArrayInt::newArray(0);
    }

    sk_sp<SkImage> image = snapshot->makeNonTextureImage();
    if (!image) {
      return jni::JArrayInt::newArray(0);
    }

    std::vector<int32_t> pixels(pixelCount);
    SkImageInfo readInfo = SkImageInfo::Make(
        width, height, kBGRA_8888_SkColorType, kPremul_SkAlphaType);
    size_t rowBytes = static_cast<size_t>(width) * sizeof(int32_t);
    if (!image->readPixels(nullptr, readInfo, pixels.data(), rowBytes, 0, 0)) {
      return jni::JArrayInt::newArray(0);
    }

    auto intArray = jni::JArrayInt::newArray(pixelCount);
    intArray->setRegion(0, pixelCount,
                        reinterpret_cast<const jint *>(pixels.data()));

    return intArray;
  }

  friend HybridBase;

  explicit JniSkiaPictureView(
      jni::alias_ref<jhybridobject> jThis,
      jni::alias_ref<JniSkiaManager::javaobject> skiaManager)
      : _manager(skiaManager->cthis()) {
    auto context = _manager->getPlatformContext();
    // The canvas provider is constructed before the view it reports to, so
    // its redraw callback goes through a slot that is bound once the view
    // exists and only ever holds it weakly.
    auto viewSlot = std::make_shared<std::weak_ptr<RNSkView>>();
    _canvasProvider = std::make_shared<RNSkOpenGLCanvasProvider>(
        [viewSlot]() {
          if (auto view = viewSlot->lock()) {
            view->requestRedraw();
          }
        },
        context);
    _view = std::make_shared<RNSkView>(context, _canvasProvider);
    *viewSlot = _view;
  }

  JniSkiaManager *_manager;
  std::shared_ptr<RNSkOpenGLCanvasProvider> _canvasProvider;
  std::shared_ptr<RNSkView> _view;
};

} // namespace RNSkia
