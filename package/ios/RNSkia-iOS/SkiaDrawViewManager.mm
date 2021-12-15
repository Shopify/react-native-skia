#include <SkiaDrawViewManager.h>
#include <React/RCTBridge+Private.h>

#include <SkiaManager.h>
#include <RNSkiaModule.h>
#include <RNSkDrawViewImpl.h>
#include <SkiaDrawView.h>

@implementation SkiaDrawViewManager {
  SkiaManager* _skiaManager;
}

RCT_CUSTOM_VIEW_PROPERTY(nativeID, NSNumber, SkiaDrawView) {
  // Get parameters
  int nativeId = [[RCTConvert NSString:json] intValue];
      
  // Get the skManager
  auto skManager = [_skiaManager skManager];
  skManager->registerSkiaDrawView(nativeId, [(SkiaDrawView*)view impl]);
  
  auto onRemoved = std::make_shared<std::function<void()>>([skManager, nativeId]() {
    skManager->unregisterSkiaDrawView(nativeId);
  });
  
  // Set a callback for when the view was removed
  [(SkiaDrawView*)view impl]->setOnRemoved(std::move(onRemoved));
}

RCT_CUSTOM_VIEW_PROPERTY(mode, NSString, SkiaDrawView) {
  if(json != NULL) {
    std::string mode = [[RCTConvert NSString:json] UTF8String];
    if(mode.compare("continuous") == 0) {
      [(SkiaDrawView*)view impl]->setDrawingMode(RNSkia::RNSkDrawingMode::Continuous);
    } else {
      [(SkiaDrawView*)view impl]->setDrawingMode(RNSkia::RNSkDrawingMode::Default);
    }
  } else {
    [(SkiaDrawView*)view impl]->setDrawingMode(RNSkia::RNSkDrawingMode::Default);
  }
}

RCT_CUSTOM_VIEW_PROPERTY(debug, BOOL, SkiaDrawView) {
  if(json != NULL) {
    bool show = [RCTConvert BOOL:json];
    [(SkiaDrawView*)view impl]->setShowDebugOverlays(show);
  } else {
    [(SkiaDrawView*)view impl]->setShowDebugOverlays(false);
  }
}

RCT_EXPORT_MODULE(ReactNativeSkiaView)

- (UIView *)view
{
  auto skManager = [_skiaManager skManager];
  return [[SkiaDrawView alloc] initWithContext:skManager->getPlatformContext()];
}

- (void) setBridge:(RCTBridge *)bridge {
  [super setBridge:bridge];
  auto skiaModule = (RNSkiaModule*)[bridge moduleForName:@"RNSkiaModule"];
  _skiaManager = [skiaModule manager];
}

@end
