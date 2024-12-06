#pragma once

#import <React/RCTBridge+Private.h>
#import <React/RCTBridge.h>

#include <functional>
#include <memory>
#include <string>

#include "RNSkPlatformContext.h"
#include "ViewScreenshotService.h"

#include <jsi/jsi.h>

namespace facebook {
namespace react {
class CallInvoker;
}
} // namespace facebook

namespace RNSkia {

namespace jsi = facebook::jsi;

class RNSkiOSPlatformContext : public RNSkPlatformContext {
public:
  RNSkiOSPlatformContext(
      RCTBridge *bridge,
      std::shared_ptr<facebook::react::CallInvoker> jsCallInvoker)
      : RNSkPlatformContext(jsCallInvoker, [[UIScreen mainScreen] scale]) {

    // Create screenshot manager
    _screenshotService =
        [[ViewScreenshotService alloc] initWithUiManager:bridge.uiManager];
  }

  ~RNSkiOSPlatformContext() = default;

  void runOnMainThread(std::function<void()>) override;

  sk_sp<SkImage> takeScreenshotFromViewTag(size_t tag) override;

  sk_sp<SkImage> makeImageFromNativeBuffer(void *buffer) override;

  sk_sp<SkImage> makeImageFromNativeTexture(jsi::Runtime &runtime,
                                            jsi::Value textureInfo, int width,
                                            int height,
                                            bool mipMapped) override;

  uint64_t makeNativeBuffer(sk_sp<SkImage> image) override;

  jsi::Value getTexture(jsi::Runtime &runtime, sk_sp<SkSurface> image) override;

  jsi::Value getTexture(jsi::Runtime &runtime, sk_sp<SkImage> image) override;

  void releaseNativeBuffer(uint64_t pointer) override;

  std::shared_ptr<RNSkVideo> createVideo(const std::string &url) override;

  std::shared_ptr<WindowContext>
  makeContextFromNativeSurface(void *surface, int width, int height) override;

  virtual void performStreamOperation(
      const std::string &sourceUri,
      const std::function<void(std::unique_ptr<SkStreamAsset>)> &op) override;

  void raiseError(const std::exception &err) override;
  sk_sp<SkSurface> makeOffscreenSurface(int width, int height) override;
#if !defined(SK_GRAPHITE)
  GrDirectContext *getDirectContext() override;
#endif
  sk_sp<SkFontMgr> createFontMgr() override;

private:
  ViewScreenshotService *_screenshotService;

  SkColorType mtlPixelFormatToSkColorType(MTLPixelFormat pixelFormat);
};

} // namespace RNSkia
