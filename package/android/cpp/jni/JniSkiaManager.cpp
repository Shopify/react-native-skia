#include "JniSkiaManager.h"

#include <android/log.h>
#include <jni.h>
#include <string>
#include <utility>

#include "RNSkManager.h"

namespace {

// For bridgeless mode, currently we don't have a way to get the JSCallInvoker
// from Java. Workaround to use RuntimeExecutor to simulate the behavior of
// JSCallInvoker. In the future when bridgeless mode is a standard and no more
// backward compatible to be considered, we could just use RuntimeExecutor to
// run task on JS thread.
class BridgelessJSCallInvoker : public facebook::react::CallInvoker {
public:
  explicit BridgelessJSCallInvoker(
      facebook::react::RuntimeExecutor runtimeExecutor)
      : runtimeExecutor_(std::move(runtimeExecutor)) {}

  void invokeAsync(std::function<void()> &&func) noexcept override {
    runtimeExecutor_(
        [func = std::move(func)](facebook::jsi::Runtime &runtime) { func(); });
  }

  void invokeSync(std::function<void()> &&func) override {
    throw std::runtime_error(
        "Synchronous native -> JS calls are currently not supported.");
  }

private:
  facebook::react::RuntimeExecutor runtimeExecutor_;

}; // class BridgelessJSCallInvoker

} // namespace

namespace RNSkia {

namespace jsi = facebook::jsi;

// JNI binding
void JniSkiaManager::registerNatives() {
  registerHybrid({
      makeNativeMethod("initHybrid", JniSkiaManager::initHybrid),
      makeNativeMethod("initializeRuntime", JniSkiaManager::initializeRuntime),
      makeNativeMethod("invalidate", JniSkiaManager::invalidate),
  });
}

// JNI init
jni::local_ref<jni::HybridClass<JniSkiaManager>::jhybriddata>
JniSkiaManager::initHybrid(
    jni::alias_ref<jhybridobject> jThis, jlong jsContext,
    jni::alias_ref<facebook::react::JRuntimeExecutor::javaobject>
        jRuntimeExecutor,
    JavaPlatformContext skiaContext) {

  auto jsCallInvoker = std::make_shared<BridgelessJSCallInvoker>(
      jRuntimeExecutor->cthis()->get());
  // cast from JNI hybrid objects to C++ instances
  return makeCxxInstance(jThis, reinterpret_cast<jsi::Runtime *>(jsContext),
                         jsCallInvoker, skiaContext->cthis());
}

void JniSkiaManager::initializeRuntime() {
  // Create the cross platform skia manager
  _skManager =
      std::make_shared<RNSkManager>(_jsRuntime, _jsCallInvoker, _context);
}

} // namespace RNSkia
