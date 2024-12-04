#include "MetalWindowContext.h"

#include "MetalContext.h"
#include "RNSkLog.h"

MetalWindowContext::MetalWindowContext(SkiaMetalContext *context, CALayer *layer, int width,
                 int height)
      : _context(context) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunguarded-availability-new"
    _layer = (CAMetalLayer *)layer;
#pragma clang diagnostic pop
    _layer.framebufferOnly = NO;
    _layer.device = MTLCreateSystemDefaultDevice();
    _layer.opaque = false;
    _layer.contentsScale = [UIScreen mainScreen].scale;
    _layer.pixelFormat = MTLPixelFormatBGRA8Unorm;
    _layer.contentsGravity = kCAGravityBottomLeft;
    _layer.drawableSize = CGSizeMake(width, height);
  }

 sk_sp<SkSurface> MetalWindowContext::getSurface() {
    if (_skSurface) {
      return _skSurface;
    }

    // Get the next drawable from the CAMetalLayer
    _currentDrawable = [_layer nextDrawable];
    if (!_currentDrawable) {
      RNSkia::RNSkLogger::logToConsole(
          "Could not retrieve drawable from CAMetalLayer");
      return nullptr;
    }

    // Get the texture from the drawable
    GrMtlTextureInfo fbInfo;
    fbInfo.fTexture.retain((__bridge void *)_currentDrawable.texture);

    GrBackendRenderTarget backendRT = GrBackendRenderTargets::MakeMtl(
        _layer.drawableSize.width, _layer.drawableSize.height, fbInfo);

    _skSurface = SkSurfaces::WrapBackendRenderTarget(
        _context->skContext.get(), backendRT, kTopLeft_GrSurfaceOrigin,
        kBGRA_8888_SkColorType, nullptr, nullptr);

    return _skSurface;
  }

    void MetalWindowContext::present() {
    if (auto dContext = GrAsDirectContext(_skSurface->recordingContext())) {
      dContext->flushAndSubmit();
    }

    id<MTLCommandBuffer> commandBuffer([_context->commandQueue commandBuffer]);
    [commandBuffer presentDrawable:_currentDrawable];
    [commandBuffer commit];
    _skSurface = nullptr;
  }
