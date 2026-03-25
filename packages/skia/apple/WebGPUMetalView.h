#pragma once

#import "RNSkUIKit.h"

@interface WebGPUMetalView : RNSkPlatformView

@property (nonatomic, strong) NSNumber *contextId;
@property (nonatomic, strong) NSString *colorSpace;

- (void)configure;
- (void)update;

@end
