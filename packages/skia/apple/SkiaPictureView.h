#pragma once

#import <memory>

#import <CoreFoundation/CoreFoundation.h>
#if !TARGET_OS_OSX
#import <UIKit/UIKit.h>
#else
#import <React/RCTUIKit.h>
#endif // !TARGET_OS_OSX

#import <React/RCTViewComponentView.h>

#import "RNSkView.h"

/**
 The Fabric component view backing <SkiaPictureView />. It owns a
 RNSkia::RNSkView (the picture and the draw logic) drawing into a
 RNSkMetalCanvasProvider (the CAMetalLayer) and registers the view with the
 RNSkManager under the JS-provided nativeId.
 */
@interface SkiaPictureView : RCTViewComponentView

- (std::shared_ptr<RNSkia::RNSkView>)skiaView;

@end
