#include <jni.h>
#include <string.h>
#include <android/native_window_jni.h>
#include <android/api-level.h>

#ifdef SK_GRAPHITE
#include "webgpu/webgpu_cpp.h"
#include "rnwgpu/SurfaceRegistry.h"
#include "rnskia/RNDawnContext.h"
#endif

#if __ANDROID_API__ >= 28
#include <android/data_space.h>

static void applyColorSpace(JNIEnv *env, ANativeWindow *window,
                            jstring jColorSpace) {
  int32_t dataSpace = ADATASPACE_SRGB;
  if (jColorSpace != nullptr) {
    const char *cs = env->GetStringUTFChars(jColorSpace, nullptr);
    if (strcmp(cs, "display-p3") == 0) {
      dataSpace = ADATASPACE_DISPLAY_P3;
    } else if (strcmp(cs, "bt2020-hlg") == 0) {
      dataSpace = ADATASPACE_BT2020_HLG;
    } else if (strcmp(cs, "bt2020-pq") == 0) {
      dataSpace = ADATASPACE_BT2020_PQ;
    }
    env->ReleaseStringUTFChars(jColorSpace, cs);
  }
  ANativeWindow_setBuffersDataSpace(window, dataSpace);
}
#endif

extern "C" JNIEXPORT void JNICALL
Java_com_shopify_reactnative_skia_WebGPUView_onSurfaceCreate(
    JNIEnv *env, jobject thiz, jobject jSurface, jint contextId, jfloat width,
    jfloat height, jstring jColorSpace) {
#ifdef SK_GRAPHITE
  auto window = ANativeWindow_fromSurface(env, jSurface);
  auto &registry = rnwgpu::SurfaceRegistry::getInstance();
  auto &dawnContext = RNSkia::DawnContext::getInstance();
  auto gpu = dawnContext.getWGPUInstance();

#if __ANDROID_API__ >= 28
  // Set color space on the native window
  applyColorSpace(env, window, jColorSpace);
#endif

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
