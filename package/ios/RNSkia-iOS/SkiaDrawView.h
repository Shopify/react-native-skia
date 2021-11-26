#pragma once

#import <CoreFoundation/CoreFoundation.h>
#import <PlatformContext.h>
#import <UIKit/UIKit.h>

class RNSkDrawViewImpl;

@interface SkiaDrawView : UIView

- (instancetype)initWithContext:
    (std::shared_ptr<RNSkia::RNSkPlatformContext>)context;

- (RNSkDrawViewImpl *)impl;

@end
