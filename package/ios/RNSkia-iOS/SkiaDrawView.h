#pragma once

#import <CoreFoundation/CoreFoundation.h>
#import <PlatformContext.h>
#import <UIKit/UIKit.h>

class RNSkDrawViewImpl;

@interface SkiaDrawView : UIView

- (instancetype)initWithContext:(RNSkia::PlatformContext *)context;

- (RNSkDrawViewImpl *)impl;

@end
