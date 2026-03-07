#include <jni.h>
#include <android/native_window_jni.h>

#ifdef SK_GRAPHITE
#include "webgpu/webgpu_cpp.h"
#include "rnwgpu/SurfaceRegistry.h"
#include "rnskia/RNDawnContext.h"
#endif

extern "C" JNIEXPORT void JNICALL
Java_com_shopify_reactnative_skia_WebGPUView_onSurfaceCreate(
    JNIEnv *env, jobject thiz, jobject jSurface, jint contextId, jfloat width,
    jfloat height) {
#ifdef SK_GRAPHITE
  auto window = ANativeWindow_fromSurface(env, jSurface);
  auto &registry = rnwgpu::SurfaceRegistry::getInstance();
  auto &dawnContext = RNSkia::DawnContext::getInstance();
  auto gpu = dawnContext.getWGPUInstance();

  // Create surface from ANativeWindow
  wgpu::SurfaceDescriptorFromAndroidNativeWindow androidSurfaceDesc;
  androidSurfaceDesc.window = window;
  wgpu::SurfaceDescriptor surfaceDescriptor;
  surfaceDescriptor.nextInChain = &androidSurfaceDesc;
  auto surface = gpu.CreateSurface(&surfaceDescriptor);

  registry
      .getSurfaceInfoOrCreate(contextId, gpu, static_cast<int>(width),
                              static_cast<int>(height))
      ->switchToOnscreen(window, surface);
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
Java_com_shopify_reactnative_skia_WebGPUView_onSurfaceDestroy(JNIEnv *env,
                                                              jobject thiz,
                                                              jint contextId) {
#ifdef SK_GRAPHITE
  auto &registry = rnwgpu::SurfaceRegistry::getInstance();
  registry.removeSurfaceInfo(contextId);
#endif
}
