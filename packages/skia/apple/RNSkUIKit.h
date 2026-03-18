#pragma once

#if !TARGET_OS_OSX
#import <UIKit/UIKit.h>
#else
#import <Appkit/Appkit.h>
#endif

#if !TARGET_OS_OSX
typedef UIView RNSkPlatformView;
#else
typedef NSView RNSkPlatformView;
#endif
