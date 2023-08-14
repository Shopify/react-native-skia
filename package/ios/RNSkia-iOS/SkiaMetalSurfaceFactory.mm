#import <RNSkLog.h>

#include <SkiaMetalSurfaceFactory.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import "SkCanvas.h"
#import "SkColorSpace.h"
#import "SkSurface.h"

#import <include/gpu/GrBackendSurface.h>
#import <include/gpu/GrDirectContext.h>
#import <include/gpu/ganesh/SkSurfaceGanesh.h>

#pragma clang diagnostic pop

thread_local SkiaMetalContext ThreadContextHolder::ThreadMetalContext;

struct OffscreenRenderContext {
  id<MTLTexture> texture;

  OffscreenRenderContext(id<MTLDevice> device,
                         sk_sp<GrDirectContext> skiaContext,
                         id<MTLCommandQueue> commandQueue, int width,
                         int height) {
    // Create a Metal texture descriptor
    MTLTextureDescriptor *textureDescriptor = [MTLTextureDescriptor
        texture2DDescriptorWithPixelFormat:MTLPixelFormatBGRA8Unorm
                                     width:width
                                    height:height
                                 mipmapped:NO];
    textureDescriptor.usage =
        MTLTextureUsageRenderTarget | MTLTextureUsageShaderRead;
    texture = [device newTextureWithDescriptor:textureDescriptor];
  }
};

id<MTLDevice> SkiaMetalSurfaceFactory::device = MTLCreateSystemDefaultDevice();

SkiaMetalContext &
SkiaMetalSurfaceFactory::createSkiaDirectContextIfNecessary() {
  if (ThreadContextHolder::ThreadMetalContext.skContext == nullptr) {
    ThreadContextHolder::ThreadMetalContext.commandQueue =
        id<MTLCommandQueue>(CFRetain((GrMTLHandle)[device newCommandQueue]));
    ThreadContextHolder::ThreadMetalContext
        .skContext = GrDirectContext::MakeMetal(
        (__bridge void *)device,
        (__bridge void *)ThreadContextHolder::ThreadMetalContext.commandQueue);
  }
  return ThreadContextHolder::ThreadMetalContext;
}

API_AVAILABLE(ios(13.0))
bool SkiaMetalSurfaceFactory::drawOnScreen(CAMetalLayer * _layer, const std::function<void(SkCanvas *)> &cb) {
	// Get render context for current thread
	auto metalContext =
		SkiaMetalSurfaceFactory::createSkiaDirectContextIfNecessary();
	// Wrap in auto release pool since we want the system to clean up after
	// rendering and not wait until later - we've seen some example of memory
	// usage growing very fast in the simulator without this.
	@autoreleasepool {

	  /* It is super important that we use the pattern of calling nextDrawable
	   inside this autoreleasepool and not depend on Skia's
	   SkSurface::MakeFromCAMetalLayer to encapsulate since we're seeing a lot of
	   drawables leaking if they're not done this way.

	   This is now reverted from:
	   (https://github.com/Shopify/react-native-skia/commit/2e2290f8e6dfc6921f97b79f779d920fbc1acceb)
	   back to the original implementation.
	   */
	  id<CAMetalDrawable> currentDrawable = [_layer nextDrawable];
	  if (currentDrawable == nullptr) {
		return false;
	  }

	  GrMtlTextureInfo fbInfo;
	  fbInfo.fTexture.retain((__bridge void *)currentDrawable.texture);

	  GrBackendRenderTarget backendRT(_layer.drawableSize.width,
									  _layer.drawableSize.height, 1, fbInfo);

	  auto skSurface = SkSurfaces::WrapBackendRenderTarget(
		  metalContext.skContext.get(), backendRT, kTopLeft_GrSurfaceOrigin,
		  kBGRA_8888_SkColorType, nullptr, nullptr);

	  if (skSurface == nullptr || skSurface->getCanvas() == nullptr) {
		RNSkia::RNSkLogger::logToConsole(
			"Skia surface could not be created from parameters.");
		return false;
	  }

	  SkCanvas *canvas = skSurface->getCanvas();
	  cb(canvas);

	  skSurface->flushAndSubmit();

	  id<MTLCommandBuffer> commandBuffer(
		  [metalContext.commandQueue commandBuffer]);
	  [commandBuffer presentDrawable:currentDrawable];
	  [commandBuffer commit];
	}

	return true;
}

sk_sp<SkSurface> SkiaMetalSurfaceFactory::makeOffscreenSurface(int width,
                                                               int height) {
  auto metalContext = createSkiaDirectContextIfNecessary();
  auto ctx = new OffscreenRenderContext(
      device, metalContext.skContext, metalContext.commandQueue, width, height);

  // Create a GrBackendTexture from the Metal texture
  GrMtlTextureInfo info;
  info.fTexture.retain((__bridge void *)ctx->texture);
  GrBackendTexture backendTexture(width, height, GrMipMapped::kNo, info);

  // Create a SkSurface from the GrBackendTexture
  auto surface = SkSurfaces::WrapBackendTexture(
      metalContext.skContext.get(), backendTexture, kTopLeft_GrSurfaceOrigin, 0,
      kBGRA_8888_SkColorType, nullptr, nullptr,
      [](void *addr) { delete (OffscreenRenderContext *)addr; }, ctx);

  return surface;
}
