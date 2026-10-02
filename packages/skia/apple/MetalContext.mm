#include "MetalContext.h"

#include "RNSkLog.h"
#include "include/core/SkGraphics.h"

#import <MetalKit/MetalKit.h>

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

// Only read/written on the main thread. Other thread-local contexts must never
// be purged from here: Ganesh contexts are not safe to access across threads.
static MetalContext *mainThreadContext = nullptr;

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
  _directContext = GrDirectContexts::MakeMetal(backendContext, grContextOptions);
  if (_directContext == nullptr) {
    RNSkia::RNSkLogger::logToConsole("Couldn't create a Skia Metal Context");
  }

  if ([NSThread isMainThread]) {
    mainThreadContext = this;
  }
}

MetalContext::~MetalContext() {
  if ([NSThread isMainThread] && mainThreadContext == this) {
    mainThreadContext = nullptr;
  }
}

void MetalContext::RequestMainThreadCleanup() {
  // Recorder destruction also queues resource releases on the main thread.
  // Run after those releases, without capturing a removed view or JS runtime.
  dispatch_async(dispatch_get_main_queue(), ^{
    if (mainThreadContext != nullptr) {
      mainThreadContext->scheduleCleanup();
    }
  });
}

void MetalContext::scheduleCleanup() {
  _cleanupRequested = true;
  if (_cleanupInFlight || _directContext == nullptr) {
    return;
  }
  _cleanupRequested = false;
  _cleanupInFlight = true;

  // Submitted draws can still retain textures after a view is gone. An empty
  // command buffer on the same Metal queue marks completion of earlier draws.
  // Its callback runs on a Metal thread; all Skia calls return to main.
  _directContext->flushAndSubmit(GrSyncCpu::kNo);
  id<MTLCommandBuffer> completion = [_commandQueue commandBuffer];
  if (completion == nil) {
    finishCleanup(); // Reclaim only currently unlocked resources on failure.
    return;
  }
  auto *context = this;
  [completion addCompletedHandler:^(id<MTLCommandBuffer>) {
    dispatch_async(dispatch_get_main_queue(), ^{
      if (mainThreadContext == context) {
        context->finishCleanup();
      }
    });
  }];
  [completion commit];
}

void MetalContext::finishCleanup() {
  // Tell Skia to retire completed command buffers before checking its cache.
  // Purging unlocked entries preserves resources used by other live canvases.
  _directContext->checkAsyncWorkCompletion();
  _directContext->purgeUnlockedResources(GrPurgeResourceOptions::kAllResources);
  SkGraphics::PurgeAllCaches();
  _cleanupInFlight = false;
  // A second teardown can arrive while the first GPU fence is pending. Give
  // that teardown its own completion fence instead of dropping the request.
  if (_cleanupRequested) {
    scheduleCleanup();
  }
}
