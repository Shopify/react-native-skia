#pragma once

#include <memory>

#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

#include <RNSkView.h>
#include <JniSkiaManager.h>
#include <RNSkAndroidView.h>

#include <android/native_window.h>
#include <android/native_window_jni.h>

#include <RNSkInfoParameter.h>

class SkPicture;
class ANativeWindow;

namespace RNSkia {
    using namespace facebook;
    using namespace jni;

    using JavaSkiaManager = jni::alias_ref<JniSkiaManager::javaobject>;


#define JNI_DRAW_VIEW_IMPL(CLASSNAME, DESCRIPTOR, RNVIEWTYPE)                                     \
                                                                                                  \
using TSelf = local_ref<HybridClass<JniSkiaDrawView>::jhybriddata>;                               \
                                                                                                  \
class JniSkiaDrawView : public JniSkiaBaseView, public jni::HybridClass<JniSkiaDrawView>          \
{                                                                                                 \
public:                                                                                           \
    static auto constexpr kJavaDescriptor = DESCRIPTOR;                                           \
                                                                                                  \
    static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> jThis,            \
                                                  JavaSkiaManager skiaManager)                    \
    {                                                                                             \
      return makeCxxInstance(jThis, skiaManager);                                                 \
    }                                                                                             \
                                                                                                  \
    static void registerNatives() {                                                               \
    registerHybrid({                                                                              \
      makeNativeMethod("surfaceAvailable", CLASSNAME::surfaceAvailable),                          \
      makeNativeMethod("surfaceDestroyed", CLASSNAME::surfaceDestroyed),                          \
      makeNativeMethod("surfaceSizeChanged", CLASSNAME::surfaceSizeChanged),                      \
      makeNativeMethod("setMode", CLASSNAME::setMode),                                            \
      makeNativeMethod("setDebugMode", CLASSNAME::setDebugMode),                                  \
      makeNativeMethod("updateTouchPoints", CLASSNAME::updateTouchPoints),                        \
      makeNativeMethod("initHybrid", CLASSNAME::initHybrid)                                       \
    });                                                                                           \
  }                                                                                               \
                                                                                                  \
  void updateTouchPoints(jni::JArrayDouble touches) override {                                    \
    JniSkiaBaseView::updateTouchPoints(touches);                                                  \
  }                                                                                               \
                                                                                                  \
  void surfaceAvailable(jobject surface, int width, int height) override {                        \
    JniSkiaBaseView::surfaceAvailable(surface, width, height);                                    \
  }                                                                                               \
                                                                                                  \
  void surfaceSizeChanged(int width, int height) override {                                       \
    JniSkiaBaseView::surfaceSizeChanged(width, height);                                           \
  }                                                                                               \
                                                                                                  \
  void surfaceDestroyed() override {                                                              \
    JniSkiaBaseView::surfaceDestroyed();                                                          \
  }                                                                                               \
                                                                                                  \
  void setMode(std::string mode) override {                                                       \
    JniSkiaBaseView::setMode(mode);                                                               \
  }                                                                                               \
                                                                                                  \
  void setDebugMode(bool show) override {                                                         \
    JniSkiaBaseView::setDebugMode(show);                                                          \
  }                                                                                               \
                                                                                                  \
  void releaseSurface() override {                                                                \
    jni::ThreadScope ts;                                                                          \
    static auto method = javaPart_->getClass()->getMethod<void(void)>("releaseSurface");          \
    method(javaPart_.get());                                                                      \
  }                                                                                               \
                                                                                                  \
private:                                                                                          \
  friend HybridBase;                                                                              \
  jni::global_ref<JniSkiaDrawView::javaobject> javaPart_;                                         \
                                                                                                  \
  explicit JniSkiaDrawView(                                                                       \
    jni::alias_ref<JniSkiaDrawView::jhybridobject> jThis,                                         \
    JavaSkiaManager skiaManager)                                                                  \
    : JniSkiaBaseView(skiaManager, [](                                                            \
    std::shared_ptr<RNSkia::RNSkPlatformContext> context,                                         \
            std::function<void()> releaseSurface) {                                               \
      return std::make_shared<RNSkAndroidView<RNVIEWTYPE>>(context, releaseSurface);              \
    }),                                                                                           \
    javaPart_(jni::make_global(jThis)) {}                                                         \
  };                                                                                              \

class JniSkiaBaseView
{
public:
    JniSkiaBaseView(JavaSkiaManager skiaManager,
                    std::function<std::shared_ptr<RNSkBaseAndroidView>(
                            std::shared_ptr<RNSkia::RNSkPlatformContext>,
                            std::function<void()>)> factory) {
      _drawView = factory(skiaManager->cthis()->getPlatformContext(),
                          std::bind(&JniSkiaBaseView::releaseSurface, this));
    }

    virtual ~JniSkiaBaseView() {}

    virtual void updateTouchPoints(jni::JArrayDouble touches) {
      // Create touch points
      std::vector<RNSkia::RNSkTouchInfo> points;
      auto pin = touches.pin();
      auto scale = _drawView->getPixelDensity();
      points.reserve(pin.size() / 5);
      for (size_t i = 0; i < pin.size(); i += 5)
      {
        RNSkTouchInfo point;
        point.x = pin[i] / scale;
        point.y = pin[i + 1] / scale;
        point.force = pin[i + 2];
        point.type = (RNSkia::RNSkTouchInfo::TouchType)pin[i + 3];
        point.id = pin[i + 4];
        points.push_back(point);
      }
      _drawView->getDrawView()->updateTouchState(points);
    }

    virtual void surfaceAvailable(jobject surface, int width, int height) {
      getDrawView()->surfaceAvailable(ANativeWindow_fromSurface(Environment::current(), surface), width, height);
    }

    virtual void surfaceSizeChanged(int width, int height) {
      getDrawView()->surfaceSizeChanged(width, height);
    }

    virtual void surfaceDestroyed() {
      getDrawView()->surfaceDestroyed();
    }

    virtual void setMode(std::string mode) {
      if (mode.compare("continuous") == 0) {
        getDrawView()->getDrawView()->setDrawingMode(RNSkDrawingMode::Continuous);
      }
      else {
        getDrawView()->getDrawView()->setDrawingMode(RNSkDrawingMode::Default);
      }
    }

    virtual void setDebugMode(bool show) {
      getDrawView()->getDrawView()->setShowDebugOverlays(show);
    }

    std::shared_ptr<RNSkView> getDrawViewImpl() { return _drawView->getDrawView(); }

protected:
    std::shared_ptr<RNSkBaseAndroidView> getDrawView() { return _drawView; }
    virtual void releaseSurface() = 0;

private:
    std::shared_ptr<RNSkBaseAndroidView> _drawView;

};

} // namespace RNSkia
