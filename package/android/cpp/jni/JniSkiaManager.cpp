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

void JniSkiaManager::initializeRuntime(jobject activity) {
  // Create the cross platform skia manager
  _skManager =
      std::make_shared<RNSkManager>(_jsRuntime, _jsCallInvoker, _context);
  auto env = jni::Environment::current();
  SwappyGL_init(env, activity);
  SwappyGL_setAutoSwapInterval(false);
  SwappyGL_setAutoPipelineMode(false);
  //SwappyGL_setBufferStuffingFixWait(1);
  SwappyGL_setSwapIntervalNS(SwappyGL_getRefreshPeriodNanos());
  // int numSupportedRefreshPeriods = 0;
  // SwappyGL_getSupportedRefreshPeriodsNS(nullptr, numSupportedRefreshPeriods);
  // // Allocate memory for refresh rates
  // std::vector<uint64_t> refreshRates(numSupportedRefreshPeriods);
  // // Step 2: Retrieve the supported refresh periods
  // SwappyGL_getSupportedRefreshPeriodsNS(refreshRates.data(), numSupportedRefreshPeriods);
  // // Now you can use the refreshRates vector as needed
  // for (int i = 0; i < numSupportedRefreshPeriods; ++i) {
  //     uint64_t refreshPeriodNs = refreshRates[i];
  //     RNSkLogger::logToConsole("refresh period: %d", refreshPeriodNs);
  // }
  RNSkLogger::logToConsole("SwappyGL initialized: %d", SwappyGL_isEnabled());
}

} // namespace RNSkia
