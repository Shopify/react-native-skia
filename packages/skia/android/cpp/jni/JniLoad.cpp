#include "JniPlatformContext.h"
#include "JniSkiaManager.h"
#include "JniSkiaPictureView.h"
#include <fbjni/fbjni.h>
#include <jni.h>

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
  return facebook::jni::initialize(vm, [] {
    RNSkia::JniSkiaManager::registerNatives();
    RNSkia::JniSkiaPictureView::registerNatives();
    RNSkia::JniPlatformContext::registerNatives();
  });
}
