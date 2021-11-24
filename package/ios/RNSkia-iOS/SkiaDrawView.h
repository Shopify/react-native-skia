#pragma once

#import <PlatformContext.h>
#import <CoreFoundation/CoreFoundation.h>
#import <UIKit/UIKit.h>
#import <MetalKit/MetalKit.h>

class RNSkDrawViewImpl;

@interface SkiaDrawView : MTKView

- (instancetype)initWithContext:(RNSkia::PlatformContext *)context;

- (RNSkDrawViewImpl *)impl;

@end
