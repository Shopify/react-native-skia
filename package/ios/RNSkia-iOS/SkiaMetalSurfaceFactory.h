#import <MetalKit/MetalKit.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import "SkCanvas.h"
#import <include/gpu/GrDirectContext.h>

#pragma clang diagnostic pop

using SkiaMetalContext = struct SkiaMetalContext {
  id<MTLCommandQueue> commandQueue = nullptr;
  sk_sp<GrDirectContext> skContext = nullptr;
};

class ThreadContextHolder {
public:
  static thread_local SkiaMetalContext ThreadMetalContext;
};

class SkiaMetalSurfaceFactory {
private:
  static id<MTLDevice> device;

public:
  static SkiaMetalContext &createSkiaDirectContextIfNecessary();
  API_AVAILABLE(ios(13.0))
  static bool drawOnScreen(CAMetalLayer *layer, const std::function<void(SkCanvas *)> &cb);
  static sk_sp<SkSurface> makeOffscreenSurface(int width, int height);
};
