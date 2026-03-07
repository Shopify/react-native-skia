#pragma once

#ifdef RCT_NEW_ARCH_ENABLED

#import "WebGPUMetalView.h"
#import <React/RCTViewComponentView.h>
#if !TARGET_OS_OSX
#import <UIKit/UIKit.h>
#else
#import <AppKit/AppKit.h>
#endif

NS_ASSUME_NONNULL_BEGIN

@interface WebGPUView : RCTViewComponentView
@end

NS_ASSUME_NONNULL_END

#endif // RCT_NEW_ARCH_ENABLED
