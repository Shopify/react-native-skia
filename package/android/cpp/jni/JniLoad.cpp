#include "JniPlatformContext.h"
#include "JniSkiaDomView.h"
#include "JniSkiaManager.h"
#include "JniSkiaPictureView.h"
#include <fbjni/fbjni.h>
#include <jni.h>

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
  return facebook::jni::initialize(vm, [] {
    RNSkia::JniSkiaManager::registerNatives();
    RNSkia::JniSkiaPictureView::registerNatives();
    RNSkia::JniSkiaDomView::registerNatives();
    RNSkia::JniPlatformContext::registerNatives();
  });
}

// TODO: move to cpp class
extern "C" JNIEXPORT void JNICALL Java_com_shopify_reactnative_skia_SkiaView_onSurfaceCreate(
    JNIEnv *env, jobject thiz, jobject surface, jint contextId, jfloat width,
    jfloat height) {
  auto window = ANativeWindow_fromSurface(env, surface);
  // windowsRegistry[contextId] = window;
  // wgpu::SurfaceDescriptorFromAndroidNativeWindow androidSurfaceDesc;
  // androidSurfaceDesc.window = window;
  // wgpu::SurfaceDescriptor surfaceDescriptor;
  // surfaceDescriptor.nextInChain = &androidSurfaceDesc;
  // auto surfaceGpu = std::make_shared<wgpu::Surface>(
  //     manager->getGPU()->get().CreateSurface(&surfaceDescriptor));
  // rnwgpu::SurfaceData surfaceData = {width, height, surfaceGpu};
  manager->surfacesRegistry.addSurface(contextId, surface);
}

extern "C" JNIEXPORT void JNICALL Java_com_shopify_reactnative_skia_SkiaView_onSurfaceDestroy(
    JNIEnv *env, jobject thiz, jint contextId) {
  ANativeWindow_release(windowsRegistry[contextId]);
  manager->surfacesRegistry.removeSurface(contextId);
}