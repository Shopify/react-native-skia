#import <RNSkDrawViewImpl.h>
#import <SkiaDrawView.h>

// These static class members are used by all the classes
id<MTLDevice> RNSkDrawViewImpl::_device = MTLCreateSystemDefaultDevice();
id<MTLCommandQueue> RNSkDrawViewImpl::_commandQueue = id<MTLCommandQueue>(CFRetain((GrMTLHandle)[_device newCommandQueue]));

sk_sp<GrDirectContext> RNSkDrawViewImpl::_skContext = nullptr;

RNSkDrawViewImpl::RNSkDrawViewImpl(SkiaDrawView* view, std::shared_ptr<RNSkia::RNSkPlatformContext> context):
  _view(view), _context(context), RNSkia::RNSkDrawView(context) {
    
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunguarded-availability-new"
    _layer = [CAMetalLayer layer];
#pragma clang diagnostic pop
    
    if(_skContext == nullptr) {
      GrContextOptions grContextOptions;
      _skContext = GrDirectContext::MakeMetal((__bridge void*)_device,
                                              (__bridge void*)_commandQueue,
                                              grContextOptions);
    }
    
    _layer.device = _device;
    _layer.opaque = false;
    _layer.contentsScale = _context->getPixelDensity();
    _layer.pixelFormat = MTLPixelFormatBGRA8Unorm;
    _layer.frame = _view.bounds;
    [_view.layer addSublayer:_layer];
}

RNSkDrawViewImpl::~RNSkDrawViewImpl() {}

void RNSkDrawViewImpl::setSize(int width, int height) {
  _width = width;
  _height = height;
  _layer.frame = CGRectMake(0, 0, width, height);
  _layer.drawableSize = CGSizeMake(width * _context->getPixelDensity(),
                                   height* _context->getPixelDensity());
  
  requestRedraw();
}

void RNSkDrawViewImpl::drawFrame(double time) {
  if(_width == -1 && _height == -1) {
    return;
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
  
  id<MTLCommandBuffer> commandBuffer([_commandQueue commandBuffer]);
  commandBuffer.label = @"Present";
  [commandBuffer presentDrawable:currentDrawable];
  [commandBuffer commit];
  
  // Calculate duration
  auto stop = std::chrono::high_resolution_clock::now();
  setLastFrameDuration(std::chrono::duration_cast<std::chrono::milliseconds>(stop - start).count());
}

void RNSkDrawViewImpl::remove() {
  // Call onRemove callback to unregister view
  if(_onRemove != nullptr) {
    (*_onRemove.get())();
    _onRemove = nullptr;
  }
  
  // Set view to null
  _view = nullptr;
  
  // Tear down Skia drawing
  _skSurface = nullptr;
  
  
}
