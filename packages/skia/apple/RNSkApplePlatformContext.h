#pragma once

#import <React/RCTBridge+Private.h>
#import <React/RCTBridge.h>

#include <functional>
#include <memory>
#include <mutex>
#include <string>

#include "RNSkPlatformContext.h"
#include "ViewScreenshotService.h"

#if !defined(SK_GRAPHITE)
#include "MetalContext.h"
#endif

namespace facebook {
namespace react {
class CallInvoker;
}
} // namespace facebook

namespace RNSkia {

class RNSkApplePlatformContext : public RNSkPlatformContext {
public:
  RNSkApplePlatformContext(
      RCTBridge *bridge,
      std::shared_ptr<facebook::react::CallInvoker> jsCallInvoker);

  ~RNSkApplePlatformContext();

  void runOnMainThread(std::function<void()>) override;

  sk_sp<SkImage> takeScreenshotFromViewTag(size_t tag) override;

  sk_sp<SkImage> makeImageFromNativeBuffer(void *buffer) override;

#if !defined(SK_GRAPHITE)
  GrDirectContext *getDirectContext() override;

  sk_sp<SkImage> makeImageFromNativeTexture(const TextureInfo &textureInfo,
                                            int width, int height,
                                            bool mipMapped) override;

  const TextureInfo getTexture(sk_sp<SkSurface> image) override;

  const TextureInfo getTexture(sk_sp<SkImage> image) override;
#endif

  uint64_t makeNativeBuffer(sk_sp<SkImage> image) override;

  void releaseNativeBuffer(uint64_t pointer) override;

  std::shared_ptr<RNSkVideo> createVideo(const std::string &url) override;

  std::shared_ptr<WindowContext>
  makeContextFromNativeSurface(void *surface, int width, int height,
                               bool useP3ColorSpace = true) override;

  virtual void performStreamOperation(
      const std::string &sourceUri,
      const std::function<void(std::unique_ptr<SkStreamAsset>)> &op) override;

  void raiseError(const std::exception &err) override;
  sk_sp<SkSurface> makeOffscreenSurface(int width, int height) override;

  sk_sp<SkFontMgr> createFontMgr() override;

  std::vector<std::string> getSystemFontFamilies() override;

  std::string resolveFontFamily(const std::string &familyName) override;

private:
  ViewScreenshotService *_screenshotService;

#if !defined(SK_GRAPHITE)
  MetalContext &metalContext();
  std::unique_ptr<MetalContext> _metalContext;
  std::once_flag _metalContextOnce;
#endif

  SkColorType mtlPixelFormatToSkColorType(MTLPixelFormat pixelFormat);
};

} // namespace RNSkia
