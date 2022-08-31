#pragma once

#import <memory>
#import <string>

#import <CoreFoundation/CoreFoundation.h>
#import <UIKit/UIKit.h>

#import <RNSkManager.h>

class RNSkiOSJsView;

@interface SkiaDrawView : UIView

- (instancetype)initWithManager: (RNSkia::RNSkManager*)manager;

- (std::shared_ptr<RNSkiOSJsView>) impl;

- (void) setDrawingMode:(std::string) mode;
- (void) setDebugMode:(bool) debugMode;
- (void) setNativeId:(size_t) nativeId;

@end
