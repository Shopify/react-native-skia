#pragma once

#include <JniPlatformContext.h>
#include <RNSkPlatformContext.h>

namespace RNSkia {
    using namespace facebook;

    class JniPlatformContextWrapper: public RNSkPlatformContext {
    public:
        JniPlatformContextWrapper(JniPlatformContext* jniPlatformContext,
                                  jsi::Runtime *runtime,
                                  std::shared_ptr<facebook::react::CallInvoker> jsCallInvoker) :
            RNSkPlatformContext(runtime,
                                jsCallInvoker,
                                [this](const std::function<void()> &func) { dispatchOnRenderThread(func); },
                                jniPlatformContext->getPixelDensity()),
            _jniPlatformContext(jniPlatformContext) {
            // Hook onto the notify draw loop callback in the platform context
            jniPlatformContext->setOnNotifyDrawLoop([this]() {
                notifyDrawLoop(false);
            });
        }


    void performStreamOperation(
            const std::string &sourceUri,
            const std::function<void(std::unique_ptr<SkStreamAsset>)> &op) override {
        _jniPlatformContext->performStreamOperation(sourceUri, op);
    }

    void raiseError(const std::exception &err) override {
        _jniPlatformContext->raiseError(err);
    }

    void startDrawLoop() override {
        _jniPlatformContext->startDrawLoop();
    }

    void stopDrawLoop() override {
        _jniPlatformContext->stopDrawLoop();
    }

    private:

        void dispatchOnRenderThread (const std::function<void(void)>&func) {
            _jniPlatformContext->dispatchOnRenderThread(func);
        }

        JniPlatformContext* _jniPlatformContext;
    };

}

