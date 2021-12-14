#import <SkiaManager.h>

#import <Foundation/Foundation.h>

#import <React/RCTBridge.h>
#import <React/RCTBridge+Private.h>

#import <ReactCommon/RCTTurboModule.h>

#import "PlatformContext.h"

@implementation SkiaManager {
  std::shared_ptr<RNSkia::RNSkManager> _skManager;
  std::shared_ptr<RNSkia::PlatformContext> _platformContext;
  __weak RCTBridge* weakBridge;
}

- (std::shared_ptr<RNSkia::RNSkManager>) skManager {
  return _skManager;
}

- (void) invalidate {
  if(_skManager != nullptr) {
    _skManager->getPlatformContext()->stopDrawLoop();
  }
  _skManager = nullptr;
  _platformContext = nullptr;    
}

- (instancetype) initWithBridge:(RCTBridge*)bridge {
  self = [super init];
  if (self) {
    RCTCxxBridge *cxxBridge = (RCTCxxBridge *)bridge;
    if (cxxBridge.runtime) {
      
      auto callInvoker = bridge.jsCallInvoker;
      jsi::Runtime* jsRuntime = (jsi::Runtime*)cxxBridge.runtime;
      
      // Create queue
      dispatch_queue_attr_t qos = dispatch_queue_attr_make_with_qos_class(DISPATCH_QUEUE_SERIAL, QOS_CLASS_USER_INITIATED, -1);
            
      auto queue = dispatch_queue_create("skia-render-thread", qos);
      
      auto dispatchOnRenderThread = [queue](std::function<void()> task) {
        dispatch_async(queue, ^{ task(); });
      };
      
      // Create platform context
      _platformContext = std::make_shared<RNSkia::PlatformContext>(jsRuntime, callInvoker, dispatchOnRenderThread);
            
      // Create the RNSkiaManager (cross platform)
      _skManager = std::make_shared<RNSkia::RNSkManager>(jsRuntime, callInvoker, _platformContext);
          
    }
  }
  return self;
}

@end
