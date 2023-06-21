#include "JniSkiaManager.h"

#include <android/log.h>
#include <jni.h>
#include <string>
#include <utility>

#include "JniSkiaDrawView.h"
#include <RNSkJsiViewApi.h>
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
  // Check if the Bitmap exists in the map
  auto it = _skManager->_viewApi->bitmapMap.find(nativeId);
  if (it != _skManager->_viewApi->bitmapMap.end()) {
    // Bitmap found, return its width
    return it->second.width;
  } else {
    // Bitmap not found, return a default value
    return -1;
  }
}

jint JniSkiaManager::getBitmapHeight(jint nativeId) {
  // Check if the Bitmap exists in the map
  auto it = _skManager->_viewApi->bitmapMap.find(nativeId);
  if (it != _skManager->_viewApi->bitmapMap.end()) {
    // Bitmap found, return its width
    return it->second.height;
  } else {
    // Bitmap not found, return a default value
    return -1;
  }
}

jintArray JniSkiaManager::getBitmap(jint nativeId) {
    JNIEnv* env = jni::Environment::current();

    // Check if the Bitmap exists in the map
    auto it = _skManager->_viewApi->bitmapMap.find(nativeId);
    if (it == _skManager->_viewApi->bitmapMap.end()) {
        // Bitmap not found, return nullptr or throw an exception
        return nullptr;
    }

    // Bitmap found, convert its data to a jintArray
    const BitmapData& bitmap = it->second;
    jintArray result = env->NewIntArray(bitmap.width * bitmap.height);

    std::vector<jint> tempData(bitmap.width * bitmap.height);
    for (int i = 0; i < bitmap.width * bitmap.height; ++i) {
        // This assumes the data in bitmap.data is in RGBA format.
        uint8_t r = bitmap.data[i * 4 + 0];
        uint8_t g = bitmap.data[i * 4 + 1];
        uint8_t b = bitmap.data[i * 4 + 2];
        uint8_t a = bitmap.data[i * 4 + 3];
        tempData[i] = (a << 24) | (r << 16) | (g << 8) | b;
    }

    env->SetIntArrayRegion(result, 0, tempData.size(), tempData.data());
    
    return result;
}

} // namespace RNSkia
