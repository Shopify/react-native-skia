#import <MetalKit/MetalKit.h>

#include <memory>

#include "SkiaContext.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import "include/core/SkCanvas.h"
#import <CoreMedia/CMSampleBuffer.h>
#import <CoreVideo/CVMetalTextureCache.h>
#import <include/gpu/GrDirectContext.h>

#pragma clang diagnostic pop

using SkiaMetalContext = struct SkiaMetalContext {
  id<MTLCommandQueue> commandQueue = nullptr;
  sk_sp<GrDirectContext> skContext = nullptr;
};

class ThreadContextHolder {
public:
  static thread_local SkiaMetalContext ThreadSkiaMetalContext;
};

class IOSSkiaContext: public RNSkia::SkiaContext {
public:
  IOSSkiaContext(CALayer* texture, int width, int height)
      : _width(width), _height(height) {

  }

  ~IOSSkiaContext() {}

  sk_sp<SkSurface> getSurface() {
    return _skSurface;
  }

  void present() override {
    // // Flush and submit the direct context
    // ThreadContextHolder::ThreadSkiaOpenGLContext.directContext
    //     ->flushAndSubmit();
  }

private:
  sk_sp<SkSurface> _skSurface = nullptr;
  int _width = 0;
  int _height = 0;

};

class SkiaMetalSurfaceFactory {
public:
  static std::shared_ptr<RNSkia::SkiaContext> makeWindowedSurface(CALayer* texture, int width, int height);
  static sk_sp<SkSurface> makeWindowedSurface(id<MTLTexture> texture, int width,
                                              int height);
  static sk_sp<SkSurface> makeOffscreenSurface(int width, int height);

  static sk_sp<SkImage>
  makeTextureFromCVPixelBuffer(CVPixelBufferRef pixelBuffer);

  static std::shared_ptr<RNSkia::SkiaContext> makeContext(CALayer* texture, int width, int height) {
    return std::make_shared<IOSSkiaContext>(texture, width, height);
  }

private:
  static id<MTLDevice> device;
  static bool
  createSkiaDirectContextIfNecessary(SkiaMetalContext *threadContext);
};
