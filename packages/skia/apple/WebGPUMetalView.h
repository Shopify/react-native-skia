#pragma once

#import "RNSkUIKit.h"

@interface WebGPUMetalView : RNSkPlatformView

@property (nonatomic, strong) NSNumber *contextId;

- (void)configure;
- (void)update;

@end
