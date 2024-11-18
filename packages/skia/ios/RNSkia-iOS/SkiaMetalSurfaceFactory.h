#pragma once

#import <MetalKit/MetalKit.h>

#include <memory>

#include "RNSkLog.h"
#include "WindowContext.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import "include/core/SkCanvas.h"
#import "include/core/SkColorSpace.h"

#import <CoreMedia/CMSampleBuffer.h>
#import <CoreVideo/CVMetalTextureCache.h>

#import <include/gpu/ganesh/GrBackendSurface.h>
#import <include/gpu/ganesh/GrDirectContext.h>
#import <include/gpu/ganesh/SkImageGanesh.h>
#import <include/gpu/ganesh/SkSurfaceGanesh.h>
#import <include/gpu/ganesh/mtl/GrMtlBackendContext.h>
#import <include/gpu/ganesh/mtl/GrMtlBackendSurface.h>
#import <include/gpu/ganesh/mtl/GrMtlDirectContext.h>
#import <include/gpu/ganesh/mtl/SkSurfaceMetal.h>

#pragma clang diagnostic pop

using SkiaMetalContext = struct SkiaMetalContext {
  id<MTLCommandQueue> commandQueue = nullptr;
  sk_sp<GrDirectContext> skContext = nullptr;
};

class SkiaMetalSurfaceFactory {
  friend class IOSSkiaContext;

public:
  static sk_sp<SkSurface> makeOffscreenSurface(id<MTLDevice> device,
                                               SkiaMetalContext *context,
                                               int width, int height);

  static sk_sp<SkImage>
  makeTextureFromCVPixelBuffer(SkiaMetalContext *context,
                               CVPixelBufferRef pixelBuffer);

  static std::unique_ptr<RNSkia::WindowContext>
  makeContext(SkiaMetalContext *context, CALayer *texture, int width,
              int height);
};

class IOSSkiaContext : public RNSkia::WindowContext {
public:
  IOSSkiaContext(SkiaMetalContext *context, CALayer *layer, int width,
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

  ~IOSSkiaContext() {}

  sk_sp<SkSurface> getSurface() override {
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

  void present() override {
    if (auto dContext = GrAsDirectContext(_skSurface->recordingContext())) {
      dContext->flushAndSubmit();
    }

    id<MTLCommandBuffer> commandBuffer([_context->commandQueue commandBuffer]);
    [commandBuffer presentDrawable:_currentDrawable];
    [commandBuffer commit];
    _skSurface = nullptr;
  }

  void resize(int width, int height) override { _skSurface = nullptr; }

  int getWidth() override { return _layer.frame.size.width * _layer.contentsScale; };

  int getHeight() override { return _layer.frame.size.height * _layer.contentsScale; };

private:
  SkiaMetalContext *_context;
  sk_sp<SkSurface> _skSurface = nullptr;
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunguarded-availability-new"
  CAMetalLayer *_layer;
#pragma clang diagnostic pop
  id<CAMetalDrawable> _currentDrawable = nil;
};
