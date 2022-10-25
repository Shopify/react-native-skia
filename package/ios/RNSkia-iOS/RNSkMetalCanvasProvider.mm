#import <RNSkMetalCanvasProvider.h>
#import <RNSkLog.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import <SkColorSpace.h>
#import <SkSurface.h>
#import <SkCanvas.h>

#import <include/gpu/GrDirectContext.h>

#pragma clang diagnostic pop

id<MTLDevice> RNSkMetalCanvasProvider::_device = nullptr;

RNSkMetalCanvasProvider::RNSkMetalCanvasProvider(std::function<void()> requestRedraw,
                        std::shared_ptr<RNSkia::RNSkPlatformContext> context):
RNSkCanvasProvider(requestRedraw),
  _context(context) {
  if (_device == nullptr) {
    _device = MTLCreateSystemDefaultDevice();
  }
  _commandQueue = id<MTLCommandQueue>(CFRetain((GrMTLHandle)[_device newCommandQueue]));
    
  #pragma clang diagnostic push
  #pragma clang diagnostic ignored "-Wunguarded-availability-new"
  _layer = [CAMetalLayer layer];
  #pragma clang diagnostic pop
    
  _layer.framebufferOnly = NO;
  _layer.device = _device;
  _layer.opaque = false;
  _layer.contentsScale = _context->getPixelDensity();
  _layer.pixelFormat = MTLPixelFormatBGRA8Unorm;
    
  _skContext = GrDirectContext::MakeMetal((__bridge void*)_device, (__bridge void*)_commandQueue);
}

RNSkMetalCanvasProvider::~RNSkMetalCanvasProvider() {
  
}

/**
 Returns the scaled width of the view
 */
float RNSkMetalCanvasProvider::getScaledWidth() { return _width * _context->getPixelDensity(); };

/**
 Returns the scaled height of the view
 */
float RNSkMetalCanvasProvider::getScaledHeight() { return _height * _context->getPixelDensity(); };

/**
 Render to a canvas
 */
void RNSkMetalCanvasProvider::renderToCanvas(const std::function<void(SkCanvas*)>& cb) {
  if(_width == -1 && _height == -1) {
    return;
  }
  
  if (_skContext == nullptr) {
    return;
  }
  
  // Wrap in auto release pool since we want the system to clean up after rendering
  // and not wait until later - we've seen some example of memory usage growing very
  // fast in the simulator without this.
  @autoreleasepool
  {
    GrMTLHandle drawableHandle;
    auto skSurface = SkSurface::MakeFromCAMetalLayer(_skContext.get(),
                                                     (__bridge GrMTLHandle)_layer,
                                                     kTopLeft_GrSurfaceOrigin,
                                                     1,
                                                     kBGRA_8888_SkColorType,
                                                     nullptr,
                                                     nullptr,
                                                     &drawableHandle);
    
    if(skSurface == nullptr || skSurface->getCanvas() == nullptr) {
      RNSkia::RNSkLogger::logToConsole("Skia surface could not be created from parameters.");
      return;
    }
    
    SkCanvas *canvas = skSurface->getCanvas();
    canvas->clear(SK_AlphaTRANSPARENT);
    cb(canvas);
    
    skSurface->flushAndSubmit();
    
    id<CAMetalDrawable> currentDrawable = (__bridge id<CAMetalDrawable>)drawableHandle;
    id<MTLCommandBuffer> commandBuffer([_commandQueue commandBuffer]);
    commandBuffer.label = @"PresentSkia";
    [commandBuffer presentDrawable:currentDrawable];
    [commandBuffer commit];
  }
};

void RNSkMetalCanvasProvider::setSize(int width, int height) {
  _width = width;
  _height = height;
  _layer.frame = CGRectMake(0, 0, width, height);
  _layer.drawableSize = CGSizeMake(width * _context->getPixelDensity(),
                                   height* _context->getPixelDensity());
  
  _requestRedraw();
}

CALayer* RNSkMetalCanvasProvider::getLayer() { return _layer; }
