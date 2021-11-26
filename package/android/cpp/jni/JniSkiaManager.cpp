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
        makeNativeMethod(
            "invalidate", JniSkiaManager::invalidate),
    });
}

// JNI init
TSelf JniSkiaManager::initHybrid(
    jni::alias_ref<jhybridobject> jThis,
    jlong jsContext,
    JSCallInvokerHolder jsCallInvokerHolder,
    JavaPlatformContext skiaContext) {

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
    // Create the cross platform skia manager
    _rnSkManager = std::make_shared<RNSkManager>(_jsRuntime, _jsCallInvoker, _context);
}

void JniSkiaManager::registerSkiaView(int viewTag, JniSkiaDrawView *skiaView) {
    _rnSkManager->registerSkiaDrawView(viewTag, skiaView);
}

void JniSkiaManager::unregisterSkiaView(int viewTag) {
    _rnSkManager->unregisterSkiaDrawView(viewTag);
}

} // namespace RNSkia
