#pragma once

#import "PlatformContext.h"
#import "RNSKDrawView.h"
#import <CoreFoundation/CoreFoundation.h>
#import <UIKit/UIKit.h>

#import <GrMtlBackendContext.h>
#import <MetalKit/MetalKit.h>
#import <QuartzCore/CAMetalLayer.h>

@class SkiaDrawView;

class RNSkDrawViewImpl : public RNSkia::RNSkDrawView {
public:
  RNSkDrawViewImpl(SkiaDrawView *view,
                   std::shared_ptr<RNSkia::RNSkPlatformContext> context);
  ~RNSkDrawViewImpl();

  void setSize(int width, int height);

protected:
  void drawFrame(double time) override;

private:
  bool createSkiaSurface();

  int _nativeId;
  int _width = -1;
  int _height = -1;

  SkiaDrawView *_view;

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunguarded-availability-new"
  CAMetalLayer *_layer;
#pragma clang diagnostic pop

  static id<MTLCommandQueue> _commandQueue;
  static id<MTLDevice> _device;
  static sk_sp<GrDirectContext> _skContext;

  std::shared_ptr<RNSkia::RNSkPlatformContext> _context;

  GrBackendRenderTarget _skRenderTarget;
  sk_sp<SkSurface> _skSurface;
};
