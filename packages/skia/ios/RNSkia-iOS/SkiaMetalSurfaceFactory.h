#import <MetalKit/MetalKit.h>

#include <memory>

#include "RNSkLog.h"
#include "SkiaContext.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import "include/core/SkCanvas.h"
#import <CoreMedia/CMSampleBuffer.h>
#import <CoreVideo/CVMetalTextureCache.h>
#import <include/gpu/ganesh/GrDirectContext.h>

#pragma clang diagnostic pop

using SkiaMetalContext = struct SkiaMetalContext {
  id<MTLCommandQueue> commandQueue = nullptr;
  sk_sp<GrDirectContext> skContext = nullptr;
};

class ThreadContextHolder {
public:
  static thread_local SkiaMetalContext ThreadSkiaMetalContext;
};

class SkiaMetalSurfaceFactory {
  friend class IOSSkiaContext;

public:
  static sk_sp<SkSurface> makeWindowedSurface(id<MTLTexture> texture, int width,
                                              int height);
  static sk_sp<SkSurface> makeOffscreenSurface(int width, int height);

  static sk_sp<SkImage>
  makeTextureFromCVPixelBuffer(CVPixelBufferRef pixelBuffer);

  static std::shared_ptr<RNSkia::SkiaContext>
  makeContext(CALayer *texture, int width, int height);

private:
  static id<MTLDevice> device;
  static bool
  createSkiaDirectContextIfNecessary(SkiaMetalContext *threadContext);
};

class IOSSkiaContext : public RNSkia::SkiaContext {
public:
  IOSSkiaContext(CALayer *layer, int width, int height) {
    auto pd = 3;
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunguarded-availability-new"
    _layer = (CAMetalLayer *)layer;
#pragma clang diagnostic pop
    _layer.framebufferOnly = NO;
    _layer.device = MTLCreateSystemDefaultDevice();
    _layer.opaque = false;
    _layer.contentsScale = pd;
    _layer.pixelFormat = MTLPixelFormatBGRA8Unorm;
    _layer.contentsGravity = kCAGravityBottomLeft;

    _layer.frame = CGRectMake(0, 0, width, height);
    _layer.drawableSize = CGSizeMake(width * pd, height * pd);
  }

  ~IOSSkiaContext() {}

  sk_sp<SkSurface> getSurface() override {
    if (_skSurface) {
      return _skSurface;
    }
    // Create the Skia Direct Context if it doesn't exist
    if (!SkiaMetalSurfaceFactory::createSkiaDirectContextIfNecessary(
            &ThreadContextHolder::ThreadSkiaMetalContext)) {
      return nullptr;
    }

    // Get the next drawable from the CAMetalLayer
    _currentDrawable = [_layer nextDrawable];
    if (!_currentDrawable) {
      RNSkia::RNSkLogger::logToConsole(
          "Could not retrieve drawable from CAMetalLayer");
      return nullptr;
    }

    // Get the texture from the drawable
    _skSurface = SkiaMetalSurfaceFactory::makeWindowedSurface(
        _currentDrawable.texture, _layer.drawableSize.width,
        _layer.drawableSize.height);
    return _skSurface;
  }

  void present() override {
    if (auto dContext = GrAsDirectContext(_skSurface->recordingContext())) {
      dContext->flushAndSubmit();
    }

    id<MTLCommandBuffer> commandBuffer(
        [ThreadContextHolder::ThreadSkiaMetalContext
                .commandQueue commandBuffer]);
    [commandBuffer presentDrawable:_currentDrawable];
    [commandBuffer commit];
    _skSurface = nullptr;
  }

private:
  sk_sp<SkSurface> _skSurface = nullptr;
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunguarded-availability-new"
  CAMetalLayer *_layer;
#pragma clang diagnostic pop
  id<CAMetalDrawable> _currentDrawable = nil;
};
