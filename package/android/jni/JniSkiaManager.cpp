#include "JniSkiaManager.h"

#include <android/log.h>
#include <jni.h>
#include <string>
#include <utility>
#include "JsiSkPaint.h"

namespace RNSkia {

using namespace facebook;

// JNI binding
void JniSkiaManager::registerNatives() {
    registerHybrid({
        makeNativeMethod("initHybrid", JniSkiaManager::initHybrid),
        makeNativeMethod(
            "initializeRuntime", JniSkiaManager::initializeRuntime),
        makeNativeMethod("registerSkiaView", JniSkiaManager::registerSkiaView),
        makeNativeMethod(
            "unregisterSkiaView", JniSkiaManager::unregisterSkiaView),
    });
}

// JNI init
TSelf JniSkiaManager::initHybrid(
    jni::alias_ref<jhybridobject> jThis,
    jlong jsContext,
    JSCallInvokerHolder jsCallInvokerHolder,
    JavaPlatformContext skiaContext) {
    __android_log_write(
        ANDROID_LOG_INFO, TAG, "Initializing JniSkiaManager...");

    // cast from JNI hybrid objects to C++ instances
    auto jsCallInvoker = jsCallInvokerHolder->cthis()->getCallInvoker();
    auto context = std::shared_ptr<JniPlatformContext>(skiaContext->cthis());

    return makeCxxInstance(
        jThis,
        reinterpret_cast<jsi::Runtime *>(jsContext),
        jsCallInvoker,
        context);
}

void JniSkiaManager::initializeRuntime() {
    __android_log_write(
        ANDROID_LOG_INFO, TAG, "Initializing ReactNativeSkia JS-Runtime...");

    // Create the cross platform skia manager
    _rnSkManager = std::make_unique<RNSkManager>(_jsRuntime, _jsCallInvoker, _context.get());

    __android_log_write(
        ANDROID_LOG_INFO, TAG, "ReactNativeSkia JS-Runtime initialized");
}

void JniSkiaManager::registerSkiaView(int viewTag, JniSkiaDrawView *skiaView) {
    __android_log_write(ANDROID_LOG_INFO, TAG, "Registering skia view");
    _rnSkManager->registerSkiaDrawView(viewTag, skiaView);
}

void JniSkiaManager::unregisterSkiaView(int viewTag) {
    __android_log_write(ANDROID_LOG_INFO, TAG, "Unregistering skia view");
    _rnSkManager->unregisterSkiaDrawView(viewTag);
}

} // namespace RNSkia
