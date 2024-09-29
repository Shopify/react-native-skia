#import <MetalKit/MetalKit.h>

#include <memory>

#include "RNSkLog.h"
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

class SkiaMetalSurfaceFactory {
friend class IOSSkiaContext;
public:
  static sk_sp<SkSurface> makeWindowedSurface(id<MTLTexture> texture, int width,
                                              int height);
  static sk_sp<SkSurface> makeOffscreenSurface(int width, int height);

  static sk_sp<SkImage>
  makeTextureFromCVPixelBuffer(CVPixelBufferRef pixelBuffer);

  static std::shared_ptr<RNSkia::SkiaContext> makeContext(CALayer* texture, int width, int height);

private:
  static id<MTLDevice> device;
  static bool
  createSkiaDirectContextIfNecessary(SkiaMetalContext *threadContext);
};

class IOSSkiaContext: public RNSkia::SkiaContext {
public:
  IOSSkiaContext(CALayer* layer, int width, int height)
	  : _width(width), _height(height) {
		  CAMetalLayer* metalLayer = (CAMetalLayer*)layer;
		  if (![metalLayer isKindOfClass:[CAMetalLayer class]]) {
			  RNSkia::RNSkLogger::logToConsole("Provided layer is not a CAMetalLayer");
			  return;
		  }

		  // Create the Skia Direct Context if it doesn't exist
		  if (!SkiaMetalSurfaceFactory::createSkiaDirectContextIfNecessary(
				  &ThreadContextHolder::ThreadSkiaMetalContext)) {
			  return;
		  }

		  // Get the next drawable from the CAMetalLayer
		  _currentDrawable = [metalLayer nextDrawable];
		  if (!_currentDrawable) {
			  RNSkia::RNSkLogger::logToConsole("Could not retrieve drawable from CAMetalLayer");
			  return;
		  }

		  // Get the texture from the drawable
		  id<MTLTexture> texture = [_currentDrawable texture];
	_skSurface = SkiaMetalSurfaceFactory::makeWindowedSurface(texture, width, height);
  }

  ~IOSSkiaContext() {}

  sk_sp<SkSurface> getSurface() override {
	return _skSurface;
  }

  void present() override {
	  if (auto dContext = GrAsDirectContext(_skSurface->recordingContext())) {
		dContext->flushAndSubmit();
	  }
	  // Present the drawable
      [_currentDrawable present];
	  //_currentDrawable = nil;
  }

private:
  sk_sp<SkSurface> _skSurface = nullptr;
  int _width = 0;
  int _height = 0;
  id<CAMetalDrawable> _currentDrawable = nil;
};
