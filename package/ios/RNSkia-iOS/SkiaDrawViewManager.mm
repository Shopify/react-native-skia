
#import <React/RCTBridge+Private.h>

#include <SkiaDrawViewManager.h>
#include <RNSkiaModule.h>
#import <SkiaManager.h>

@implementation SkiaDrawViewManager {
  SkiaManager* _skiaManager;
}

RCT_CUSTOM_VIEW_PROPERTY(nativeID, NSNumber, SkiaDrawView) {
  // Get parameters
  int nativeId = [[RCTConvert NSString:json] intValue];
  SkiaDrawViewImpl* drawView = [(SkiaDrawView*)view impl];
      
  // Get the skManager
  auto skManager = [_skiaManager skManager];
  skManager->registerSkiaDrawView(nativeId, drawView);
  
  auto onDestroy = std::make_shared<std::function<void()>>([=]() {
    skManager->unregisterSkiaDrawView(nativeId);
  });
  
  // Set a callback for when the view was removed
  drawView->setOnDestroy(std::move(onDestroy));
}

RCT_CUSTOM_VIEW_PROPERTY(mode, NSString, SkiaDrawView) {
  std::string mode = [[RCTConvert NSString:json] UTF8String];
  SkiaDrawViewImpl* drawView = [(SkiaDrawView*)view impl];
  if(mode.compare("continuous") == 0) {
    drawView->setDrawingMode(RNSkia::RNSkDrawingMode::Continuous);
  } else {
    drawView->setDrawingMode(RNSkia::RNSkDrawingMode::Default);
  }
}

RCT_CUSTOM_VIEW_PROPERTY(debug, BOOL, SkiaDrawView) {
  bool show = [RCTConvert BOOL:json];
  SkiaDrawViewImpl* drawView = [(SkiaDrawView*)view impl];
  drawView->setShowDebugOverlays(show);
}

RCT_EXPORT_MODULE(ReactNativeSkiaView)

- (UIView *)view
{
  return [[SkiaDrawView alloc] initWithContext:(RNSkia::PlatformContext*)_skiaManager.skManager->getPlatformContext()];
}

- (void) setBridge:(RCTBridge *)bridge {
  [super setBridge:bridge];
  auto skiaModule = (RNSkiaModule*)[bridge moduleForName:@"RNSkiaModule"];
  _skiaManager = [skiaModule manager];
}

@end
