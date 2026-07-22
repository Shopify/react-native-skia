#include <android/native_window_jni.h>
#include <jni.h>

#ifdef SK_GRAPHITE
#include <memory>
#include <utility>

#include <ReactCommon/CallInvoker.h>

#include "rnskia/RNDawnContext.h"
#include "rnwgpu/SurfaceRegistry.h"
#include "rnwgpu/async/RuntimeContext.h"
#include "webgpu/webgpu_cpp.h"

namespace {
// Applies a surface attach latched by the platform UI thread (see
// SurfaceInfo::applyPendingAttach) from the JS thread. Surface attaches are
// normally adopted at the next frame boundary by whichever thread renders;
// this flush covers contexts that are not actively rendering (static
// content), so the last offscreen frame still makes it on screen. Mirrors
// react-native-webgpu's RNWebGPUManager::flushPendingSurfaceTransition.
void flushPendingSurfaceTransition(std::shared_ptr<rnwgpu::SurfaceInfo> info) {
  if (info == nullptr) {
    return;
  }
  auto invoker = rnwgpu::async::RuntimeContext::mainCallInvoker();
  if (invoker == nullptr) {
    return;
  }
  invoker->invokeAsync(
      [info = std::move(info)] { info->applyPendingAttach(); });
}
} // namespace
#endif

extern "C" JNIEXPORT void JNICALL
Java_com_shopify_reactnative_skia_WebGPUView_onSurfaceCreate(
    JNIEnv *env, jobject thiz, jobject jSurface, jint contextId, jfloat width,
    jfloat height) {
#ifdef SK_GRAPHITE
  // ANativeWindow_fromSurface acquires a reference; SurfaceInfo releases it
  // (via the releaser below) once it is done with the window.
  auto window = ANativeWindow_fromSurface(env, jSurface);
  if (window == nullptr) {
    return;
  }
  auto &registry = rnwgpu::SurfaceRegistry::getInstance();
  auto &dawnContext = RNSkia::DawnContext::getInstance();
  auto gpu = dawnContext.getWGPUInstance();

  // Create surface from ANativeWindow
  wgpu::SurfaceSourceAndroidNativeWindow androidSurfaceDesc;
  androidSurfaceDesc.window = window;
  wgpu::SurfaceDescriptor surfaceDescriptor;
  surfaceDescriptor.nextInChain = &androidSurfaceDesc;
  auto surface = gpu.CreateSurface(&surfaceDescriptor);

  // Find-or-create + attach runs atomically under the registry lock so a
  // concurrent destroyContext cannot orphan this surface.
  auto info = registry.attachSurface(
      contextId, gpu, static_cast<int>(width), static_cast<int>(height), window,
      surface, [](void *nativeSurface) {
        ANativeWindow_release(static_cast<ANativeWindow *>(nativeSurface));
      });
  // The attach is adopted at the next frame boundary by the rendering thread;
  // schedule a flush so contexts that are not currently rendering still pick
  // it up (and present their last offscreen frame).
  flushPendingSurfaceTransition(info);
#endif
}

extern "C" JNIEXPORT void JNICALL
Java_com_shopify_reactnative_skia_WebGPUView_onSurfaceChanged(
    JNIEnv *env, jobject thiz, jobject surface, jint contextId, jfloat width,
    jfloat height) {
#ifdef SK_GRAPHITE
  auto &registry = rnwgpu::SurfaceRegistry::getInstance();
  auto surfaceInfo = registry.getSurfaceInfo(contextId);
  if (surfaceInfo) {
    surfaceInfo->resize(static_cast<int>(width), static_cast<int>(height));
  }
#endif
}

extern "C" JNIEXPORT void JNICALL
Java_com_shopify_reactnative_skia_WebGPUView_switchToOffscreenSurface(
    JNIEnv *env, jobject thiz, jint contextId) {
#ifdef SK_GRAPHITE
  auto &registry = rnwgpu::SurfaceRegistry::getInstance();
  auto surfaceInfo = registry.getSurfaceInfo(contextId);
  if (surfaceInfo) {
    surfaceInfo->switchToOffscreen();
  }
#endif
}

extern "C" JNIEXPORT void JNICALL
Java_com_shopify_reactnative_skia_WebGPUView_onViewDestroyed(JNIEnv *env,
                                                             jobject thiz,
                                                             jint contextId) {
#ifdef SK_GRAPHITE
  // The view dies with its Canvas (contextIds are never reused), so view
  // teardown retires the registry entry. The JS-side cleanup
  // (RNWebGPU.destroyContext) only handles entries that never had a native
  // surface; see RNWebGPU::destroyContext for the ownership split.
  auto &registry = rnwgpu::SurfaceRegistry::getInstance();
  if (auto info = registry.getSurfaceInfo(contextId)) {
    info->detachSurface();
  }
  registry.removeSurfaceInfo(contextId);
#endif
}
