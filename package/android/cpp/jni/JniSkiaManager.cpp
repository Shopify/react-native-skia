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
      makeNativeMethod("getJsiProperty", JniSkiaManager::getJsiProperty),
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

jbyteArray JniSkiaManager::getJsiProperty(jint nativeId, jstring name) {
    JNIEnv* env = jni::Environment::current();
    
    // Convert the nativeId and name parameters to C++ values
    int convertedNativeId = static_cast<int>(nativeId);
    const char* convertedName = env->GetStringUTFChars(name, nullptr);
    
    // Generate a 100x100 bitmap of the color cyan
    const int width = 100;
    const int height = 100;
    const int pixelSize = 4;  // ARGB_8888 format
    const int byteArrayLength = width * height * pixelSize;
    jbyteArray byteArray = env->NewByteArray(byteArrayLength);
    jbyte* byteArrayData = env->GetByteArrayElements(byteArray, nullptr);
    
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            int offset = (y * width + x) * pixelSize;
            byteArrayData[offset] = 0xFF;     // Alpha
            byteArrayData[offset + 1] = 0x00; // Red
            byteArrayData[offset + 2] = 0xFF; // Green
            byteArrayData[offset + 3] = 0xFF; // Blue
        }
    }
    
    env->ReleaseByteArrayElements(byteArray, byteArrayData, 0);
    env->ReleaseStringUTFChars(name, convertedName);
    
    return byteArray;
}


} // namespace RNSkia
