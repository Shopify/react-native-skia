#pragma once

#if defined(SK_GRAPHITE)

#import "SkiaUIView.h"

/**
 * A Fabric component presenting Graphite recordings: JS records frames
 * through the context returned by SkiaViewApi.makeGraphiteContext, the view
 * replays them on its display link.
 */
@interface SkiaGraphiteView : SkiaUIView

@end

#else

#import <React/RCTViewComponentView.h>

// Placeholder for builds without the Graphite backend: the component exists
// so that the app links, but it renders nothing.
@interface SkiaGraphiteView : RCTViewComponentView

@end

#endif // SK_GRAPHITE
