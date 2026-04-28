#include "MetalContext.h"

#include "RNSkLog.h"

#import <MetalKit/MetalKit.h>
#import <UIKit/UIKit.h>
#import <chrono>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import <include/gpu/ganesh/GrBackendSurface.h>
#import <include/gpu/ganesh/SkImageGanesh.h>
#import <include/gpu/ganesh/mtl/GrMtlBackendContext.h>
#import <include/gpu/ganesh/mtl/GrMtlBackendSurface.h>
#import <include/gpu/ganesh/mtl/GrMtlDirectContext.h>
#import <include/gpu/ganesh/mtl/GrMtlTypes.h>
#import <include/gpu/ganesh/mtl/SkSurfaceMetal.h>

#pragma clang diagnostic pop

MetalContext::~MetalContext() {
  [[NSNotificationCenter defaultCenter] removeObserver:_memoryWarningObserver];
}

MetalContext::MetalContext() {
  _device = MTLCreateSystemDefaultDevice();
  if (!_device) {
    throw std::runtime_error("Failed to create Metal device");
  }

  _commandQueue =
      id<MTLCommandQueue>(CFRetain((GrMTLHandle)[_device newCommandQueue]));
  GrMtlBackendContext backendContext = {};
  backendContext.fDevice.reset((__bridge void *)_device);
  backendContext.fQueue.reset((__bridge void *)_commandQueue);
  GrContextOptions grContextOptions; // set different options here.

  // Create the Skia Direct Context
  _directContext = GrDirectContexts::MakeMetal(backendContext);
  if (_directContext == nullptr) {
    RNSkia::RNSkLogger::logToConsole("Couldn't create a Skia Metal Context");
  }

  // Add a memory warning listener to purge cache
  _memoryWarningObserver = [
    [NSNotificationCenter defaultCenter]
      addObserverForName:UIApplicationDidReceiveMemoryWarningNotification
      object:nil
      queue:nil
      usingBlock:^(__unused NSNotification *notification) {
        // Clean unused Skia textures (cache/GPU)
        _directContext->performDeferredCleanup(std::chrono::milliseconds(0));
        if (_metalTextureCache != nil) {
          // Flush Metal Texture Cache pool (this can have a huge impact)
          CVMetalTextureCacheFlush(_metalTextureCache, 0);
        }
      }
  ];
}


CVMetalTextureCacheRef MetalContext::getMetalTextureCache() {
  if (_metalTextureCache == nil) {
    // Create a new Texture Cache
    auto result = CVMetalTextureCacheCreate(kCFAllocatorDefault, nil, _device,
                                            nil, &_metalTextureCache);
    if (result != kCVReturnSuccess || _metalTextureCache == nil) {
      throw std::runtime_error("Failed to create Metal Texture Cache!");
    }
  }
  return _metalTextureCache;
}
