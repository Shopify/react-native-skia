#import "SkiaManager.h"

#import <Foundation/Foundation.h>

#import <React/RCTBridge+Private.h>
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>

#import "RNSkApplePlatformContext.h"

#if defined(SK_GRAPHITE)
#import "RNDawnContext.h"
#else
#import "MetalContext.h"
#endif

static __weak SkiaManager *sharedInstance = nil;

@implementation SkiaManager {
  std::shared_ptr<RNSkia::RNSkManager> _skManager;
  __weak RCTBridge *weakBridge;
}

- (std::shared_ptr<RNSkia::RNSkManager>)skManager {
  return _skManager;
}

- (void)invalidate {
  _skManager = nullptr;
  // Invalidate the Metal/Dawn context to ensure fresh GPU resources
  // are created after a bridge reload (e.g., Expo OTA updates).
  // Without this, the thread-local singleton would retain stale
  // GPU context references causing crashes.
#if defined(SK_GRAPHITE)
  RNSkia::DawnContext::getInstance().invalidate();
#else
  MetalContext::getInstance().invalidate();
#endif
}

- (instancetype)initWithBridge:(RCTBridge *)bridge
                     jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)
                                   jsInvoker {
  self = [super init];
  if (self) {
    sharedInstance = self;
    RCTCxxBridge *cxxBridge = (RCTCxxBridge *)bridge;
    if (cxxBridge.runtime) {

      facebook::jsi::Runtime *jsRuntime =
          (facebook::jsi::Runtime *)cxxBridge.runtime;

      // Create the RNSkiaManager (cross platform)
      _skManager = std::make_shared<RNSkia::RNSkManager>(
          jsRuntime, jsInvoker,
          std::make_shared<RNSkia::RNSkApplePlatformContext>(bridge,
                                                             jsInvoker));
    }
  }
  return self;
}

- (void)dealloc {
  sharedInstance = nil;
}

#ifdef RCT_NEW_ARCH_ENABLED
+ (std::shared_ptr<RNSkia::RNSkManager>)latestActiveSkManager {
  if (sharedInstance != nil) {
    return [sharedInstance skManager];
  }
  return nullptr;
}
#endif // RCT_NEW_ARCH_ENABLED
@end
