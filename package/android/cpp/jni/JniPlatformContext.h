#pragma once

#include <fbjni/fbjni.h>
#include <ReactCommon/CallInvokerHolder.h>

#include "RNSkPlatformContext.h"

namespace RNSkia {

using namespace facebook;

using JSCallInvokerHolder =
    jni::alias_ref<facebook::react::CallInvokerHolder::javaobject>;

class JniPlatformContext : public jni::HybridClass<JniPlatformContext>,
                           public RNSkPlatformContext {
   public:
    static auto constexpr kJavaDescriptor = "Lcom/shopify/reactnative/skia/PlatformContext;";
    static jni::local_ref<jhybriddata> initHybrid(
        jni::alias_ref<jhybridobject> jThis,
        jlong jsContext,
        JSCallInvokerHolder jsCallInvokerHolder,
        const float);

    static void registerNatives();

    ~JniPlatformContext() {
        endDrawLoop();
    }

    void performStreamOperation(
        const std::string &sourceUri,
        const std::function<void(std::unique_ptr<SkStream>)> &op) override;

    void raiseError(const std::exception &err) override;

    void beginDrawLoop() override;
    void endDrawLoop() override;

    void notifyDrawLoopExternal(double timestampNanos);

private:
    friend HybridBase;
    jni::global_ref<JniPlatformContext::javaobject> javaPart_;

    size_t _listenerId = 0;
    std::map<size_t, std::function<void(double)>> _drawCallbacks;

    explicit JniPlatformContext(
        jni::alias_ref<JniPlatformContext::jhybridobject> jThis,
        jsi::Runtime *runtime,
        std::shared_ptr<facebook::react::CallInvoker> jsCallInvoker,
        const float pixelDensity)
        : RNSkPlatformContext(runtime, jsCallInvoker, pixelDensity),
          javaPart_(jni::make_global(jThis)) {}
};
} // namespace RNSkia