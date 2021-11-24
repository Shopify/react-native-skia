#pragma once

#import <PlatformContext.h>
#import <CoreFoundation/CoreFoundation.h>
#import <UIKit/UIKit.h>

class RNSkDrawViewImpl;

@interface SkiaDrawView : UIView

- (instancetype)initWithContext:(RNSkia::PlatformContext *)context;

- (RNSkDrawViewImpl *)impl;

@end
