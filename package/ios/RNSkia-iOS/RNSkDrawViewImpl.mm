#import <RNSkDrawViewImpl.h>
#import <SkiaDrawView.h>

RNSkDrawViewImpl::RNSkDrawViewImpl(MTKView* view, RNSkia::PlatformContext* context):
  _view(view), _context(context), RNSkia::RNSkDrawView(context) {
    
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunguarded-availability-new"
    _layer = (CAMetalLayer*)_view.layer;
#pragma clang diagnostic pop
    
    _device = view.device;
    auto queue = [_device newCommandQueue];
    if(queue == nullptr) {
       NSLog(@"Failed to create command queue");
       return;
    }
    
    _commandQueue = id<MTLCommandQueue>(CFRetain((GrMTLHandle)queue));
}

RNSkDrawViewImpl::~RNSkDrawViewImpl() {
}

void RNSkDrawViewImpl::setSize(int width, int height) {
  _width = width;
  _height = height;
  _layer.drawableSize = CGSizeMake(width * _context->getPixelDensity(),
                                   height* _context->getPixelDensity());
  
  requestRedraw();
}

void RNSkDrawViewImpl::drawFrame(double time) {
  if(_width == -1 && _height == -1) {
    return;
  }
  
  if(_commandQueue == nullptr) {
    NSLog(@"Metal command queue not available.");
    return;
  }
  
  if(_skContext == nullptr) {
    GrContextOptions grContextOptions;
    _skContext = GrDirectContext::MakeMetal((__bridge void*)_device,
                                            (__bridge void*)_commandQueue,
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
  _skSurface = nullptr;
  _skContext = nullptr;

  // Tear down Metal
  if(_commandQueue != NULL) {
    _commandQueue = NULL;
  }
  if(_device != NULL) {
    _device = NULL;
  }
}
