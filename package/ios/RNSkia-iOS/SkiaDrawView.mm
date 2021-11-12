
#import "SkiaDrawView.h"

#import <RNSkLog.h>

#import <chrono>

SkiaDrawViewImpl::SkiaDrawViewImpl(SkiaDrawView* view, RNSkia::PlatformContext* context):
    RNSkia::RNSkDrawView(context), _context(context), _view(view) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunguarded-availability-new"
    _layer = (CAMetalLayer*)_view.layer;
#pragma clang diagnostic pop
    _layer.opaque = false;
    _layer.contentsScale = _context->getPixelDensity();
    _layer.pixelFormat = MTLPixelFormatBGRA8Unorm;
    
    _device = _layer.device;
    if(_device == nullptr) {
        NSLog(@"Failed to set current metal device");
       return;
    }
    _queue = (id<MTLCommandQueue>)CFRetain((GrMTLHandle)[_device newCommandQueue]);
}

void SkiaDrawViewImpl::setSize(int width, int height) {
  _width = width;
  _height = height;  
  _layer.drawableSize = CGSizeMake(width * _context->getPixelDensity(),
                                   height* _context->getPixelDensity());
  
  requestRedraw();
}

void SkiaDrawViewImpl::drawFrame(double time) {
  if(_width == -1 && _height == -1) {
    return;
  }
  
  if(_skContext == nullptr) {
    GrContextOptions grContextOptions;
    _skContext = GrDirectContext::MakeMetal((__bridge void*)_device,
                                            (__bridge void*)_queue,
                                            grContextOptions);
  }
  
  auto sampleCount = 1;
  auto start = std::chrono::high_resolution_clock::now();
  
  id<CAMetalDrawable> currentDrawable = [_layer nextDrawable];
  GrMtlTextureInfo fbInfo;
  fbInfo.fTexture.retain((__bridge void*)currentDrawable.texture);

  GrBackendRenderTarget backendRT(_width * _context->getPixelDensity(),
                                  _height * _context->getPixelDensity(),
                                  sampleCount,
                                  fbInfo);

  _skSurface = SkSurface::MakeFromBackendRenderTarget(_skContext.get(),
                                                      backendRT,
                                                      kTopLeft_GrSurfaceOrigin,
                                                      kBGRA_8888_SkColorType,
                                                      nullptr,
                                                      nullptr);
  
  if(_skSurface == nullptr) {
    RNSkia::RNSkLogger::logToConsole("Skia surface could not be created from parameters.");
    return;
  }
  
  _skSurface->getCanvas()->clear(SK_AlphaTRANSPARENT);
  drawInSurface(_skSurface,
                _width * _context->getPixelDensity(),
                _height * _context->getPixelDensity(),
                time,
                _context);
  
  id<MTLCommandBuffer> commandBuffer([_queue commandBuffer]);
  commandBuffer.label = @"Present";
  [commandBuffer presentDrawable:currentDrawable];
  [commandBuffer commit];
  
  // Calculate duration
  auto stop = std::chrono::high_resolution_clock::now();
  setLastFrameDuration(std::chrono::duration_cast<std::chrono::milliseconds>(stop - start).count());
}

void SkiaDrawViewImpl::destroy() {
  // Call unregister code
  if(_onDestroy != nullptr) {
    (*_onDestroy.get())();
    _onDestroy = nullptr;
  }
  
  // Tear down Skia drawing
  _skSurface = nullptr;
  _skSurface = nullptr;
  _skContext = nullptr;

  // Tear down Metal
  if(_device) {
    _device = NULL;
  }
  if(_queue) {
    _queue = NULL;
  }
}

@implementation SkiaDrawView {
  std::unique_ptr<SkiaDrawViewImpl> _impl;
}

- (instancetype)initWithContext: (RNSkia::PlatformContext*) context
{
  self = [super init];
  if (self) {
    self.layer.opaque = true;
    _impl = std::make_unique<SkiaDrawViewImpl>(self, context);
  }
  return self;
}

+ (Class)layerClass
{
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunguarded-availability-new"
  return [CAMetalLayer class];
#pragma clang diagnostic pop
}

- (void) layoutSubviews {
  [super layoutSubviews];
  _impl->setSize(self.bounds.size.width, self.bounds.size.height);
}

- (SkiaDrawViewImpl*) impl {
  return _impl.get();
}

- (void) willMoveToWindow:(UIWindow *)newWindow {
  [super willMoveToWindow: newWindow];
  if (newWindow == nil) {
    _impl->destroy();
  }
}

@end
