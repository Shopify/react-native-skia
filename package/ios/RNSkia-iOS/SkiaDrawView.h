#pragma once

#import <CoreFoundation/CoreFoundation.h>
#import <RNSkManager.h>
#import <UIKit/UIKit.h>

class RNSkDrawViewImpl;

@interface SkiaDrawView : UIView

- (instancetype)initWithManager: (RNSkia::RNSkManager*)manager;

- (RNSkDrawViewImpl *)impl;

- (void) setDrawingMode:(std::string) mode;
- (void) setDebugMode:(bool) debugMode;
- (void) setNativeId:(size_t) nativeId;

@end
