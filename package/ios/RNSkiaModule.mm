
#import "RNSkiaModule.h"

@implementation RNSkiaModule {
  SkiaManager* skiaManager;
}

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE()

#pragma Accessors

-(SkiaManager*) manager {
  return skiaManager;
}

#pragma Setup and invalidation

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (void)invalidate
{
  [skiaManager invalidate];
  skiaManager = NULL;
}

- (void)setBridge:(RCTBridge *)bridge
{
  _bridge = bridge;
  skiaManager = [[SkiaManager alloc] initWithBridge:bridge];
}

@end
