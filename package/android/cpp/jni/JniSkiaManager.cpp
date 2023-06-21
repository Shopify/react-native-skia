#include "JniSkiaManager.h"

#include <android/log.h>
#include <jni.h>
#include <string>
#include <utility>

#include "JniSkiaDrawView.h"
#include <RNSkManager.h>

namespace RNSkia {

namespace jsi = facebook::jsi;

// JNI binding
void JniSkiaManager::registerNatives() {
  registerHybrid({
      makeNativeMethod("initHybrid", JniSkiaManager::initHybrid),
      makeNativeMethod("initializeRuntime", JniSkiaManager::initializeRuntime),
      makeNativeMethod("invalidate", JniSkiaManager::invalidate),
      makeNativeMethod("getBitmap", JniSkiaManager::getBitmap),
      makeNativeMethod("getBitmapWidth", JniSkiaManager::getBitmapWidth),
      makeNativeMethod("getBitmapHeight", JniSkiaManager::getBitmapHeight),
  });
}

// JNI init
jni::local_ref<jni::HybridClass<JniSkiaManager>::jhybriddata>
JniSkiaManager::initHybrid(jni::alias_ref<jhybridobject> jThis, jlong jsContext,
                           JSCallInvokerHolder jsCallInvokerHolder,
                           JavaPlatformContext skiaContext) {

  // cast from JNI hybrid objects to C++ instances
  return makeCxxInstance(jThis, reinterpret_cast<jsi::Runtime *>(jsContext),
                         jsCallInvokerHolder->cthis()->getCallInvoker(),
                         skiaContext->cthis());
}

void JniSkiaManager::initializeRuntime() {
  // Create the cross platform skia manager
  _skManager =
      std::make_shared<RNSkManager>(_jsRuntime, _jsCallInvoker, _context);
}

jint JniSkiaManager::getBitmapWidth(jint nativeId) {
    return 100;
}

jint JniSkiaManager::getBitmapHeight(jint nativeId) {
    return 100;
}

jintArray JniSkiaManager::getBitmap(jint nativeId) {
    JNIEnv* env = jni::Environment::current();
    
    // Convert the nativeId and name parameters to C++ values
    int convertedNativeId = static_cast<int>(nativeId);
    _skManager;   
    // Generate a 100x100 bitmap of the color cyan
    const int width = 100;
    const int height = 100;
    const int pixelSize = 1;  // Single integer per pixel (ARGB format)
    const int arrayLength = width * height;
    jintArray intArray = env->NewIntArray(arrayLength);
    jint* intArrayData = env->GetIntArrayElements(intArray, nullptr);
    
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            int offset = y * width + x;
            int pixel = 0xFF00FFFF; // ARGB value for cyan
            intArrayData[offset] = pixel;
        }
    }
    
    env->ReleaseIntArrayElements(intArray, intArrayData, 0);
    
    return intArray;
}

} // namespace RNSkia
