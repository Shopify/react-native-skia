
#import "RNSkiaModule.h"
#import <React/RCTBridge+Private.h>
#import <ReactCommon/RCTTurboModule.h>

@implementation RNSkiaModule {
  SkiaManager *skiaManager;
  std::shared_ptr<facebook::react::CallInvoker> jsInvoker;
}

RCT_EXPORT_MODULE()

#pragma Accessors

- (SkiaManager *)manager {
  return skiaManager;
}

#pragma Setup and invalidation

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (void)invalidate {
  if (skiaManager != nil) {
    [skiaManager invalidate];
  }
  skiaManager = nil;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(install) {
  if (skiaManager != nil) {
    // Already initialized, ignore call.
    return @true;
  }
  RCTBridge *bridge = [RCTBridge currentBridge];
  if (!jsInvoker) {
    jsInvoker = bridge.jsCallInvoker;
  }
  skiaManager = [[SkiaManager alloc] initWithBridge:bridge jsInvoker:jsInvoker];
  return @true;
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  jsInvoker = params.jsInvoker;
  return std::make_shared<facebook::react::NativeSkiaModuleSpecJSI>(params);
}
#endif

@end
