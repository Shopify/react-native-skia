
#import "PlatformContext.h"
#import "RNSKDrawView.h"
#import <CoreFoundation/CoreFoundation.h>
#import <UIKit/UIKit.h>

#import <GrMtlBackendContext.h>
#import <MetalKit/MetalKit.h>
#import <QuartzCore/CAMetalLayer.h>

@class SkiaDrawView;

class SkiaDrawViewImpl : public RNSkia::RNSkDrawView {
public:
  SkiaDrawViewImpl(SkiaDrawView *view, RNSkia::PlatformContext *context);
  ~SkiaDrawViewImpl() {}

  void destroy();

  void setOnDestroy(std::shared_ptr<std::function<void()>> func) {
    _onDestroy = func;
  }

  void setSize(int width, int height);    

protected:
  void drawFrame(double time) override;

private:
  bool createSkiaSurface();

  SkiaDrawView *_view;
  int _nativeId;
  int _width = -1;
  int _height = -1;

  id<MTLDevice> _device;
  id<MTLCommandQueue> _queue;

  // CAMetalLayer was introduced in iOS 8... :) Warning comes
  // from target SDK Simulator
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunguarded-availability-new"
  CAMetalLayer *_layer;
#pragma clang diagnostic pop

  RNSkia::PlatformContext *_context;

  GrBackendRenderTarget _skRenderTarget;
  sk_sp<SkSurface> _skSurface;
  sk_sp<GrDirectContext> _skContext;

  std::shared_ptr<std::function<void()>> _onDestroy;
};

@interface SkiaDrawView : UIView

- (instancetype)initWithContext:(RNSkia::PlatformContext *)context;

- (SkiaDrawViewImpl *)impl;

@end
