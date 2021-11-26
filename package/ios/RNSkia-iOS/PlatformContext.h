#pragma once

#include <DisplayLink.h>
#include <RNSkPlatformContext.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkStream.h>

#pragma clang diagnostic pop

#include <ReactCommon/CallInvoker.h>
#include <jsi/jsi.h>

namespace RNSkia {

using namespace facebook;

class PlatformContext : public RNSkPlatformContext {
public:
  PlatformContext(jsi::Runtime *runtime,
                  std::shared_ptr<react::CallInvoker> callInvoker,
                  const std::function<void(const std::function<void(void)> &)>
                      dispatchOnRenderThread)
      : RNSkPlatformContext(runtime, callInvoker, dispatchOnRenderThread,
                            [[UIScreen mainScreen] scale]) {}

  ~PlatformContext() {}

  void startDrawLoop() override;
  void stopDrawLoop() override;

  virtual void performStreamOperation(
      const std::string &sourceUri,
      const std::function<void(std::unique_ptr<SkStream>)> &op) override;

  void raiseError(const std::exception &err) override;

private:
  DisplayLink *_displayLink;
};

} // namespace RNSkia
