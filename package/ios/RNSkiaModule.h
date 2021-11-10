
#import <React/RCTBridgeModule.h>

#include <RNSkia-iOS/SkiaManager.h>

@interface RNSkiaModule : NSObject <RCTBridgeModule>

- (SkiaManager *)manager;

@end
