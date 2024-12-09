
#include "SkiaDomViewManager.h"
#include <React/RCTBridge+Private.h>

#include "RNSkDomView.h"
#include "RNSkIOSView.h"
#include "RNSkPlatformContext.h"

#include "RNSkiaModule.h"
#include "SkiaManager.h"
#include "SkiaUIView.h"

@implementation SkiaDomViewManager

RCT_EXPORT_MODULE(SkiaDomView)

- (SkiaManager *)skiaManager {
  auto bridge = self.bridge;
  RCTAssert(bridge, @"Bridge must not be nil.");
  auto skiaModule = (RNSkiaModule *)[bridge moduleForName:@"RNSkiaModule"];
  return [skiaModule manager];
}

RCT_CUSTOM_VIEW_PROPERTY(nativeID, NSNumber, SkiaUIView) {
  // Get parameter
  int nativeId = [[RCTConvert NSString:json] intValue];
  [(SkiaUIView *)view setNativeId:nativeId];
}

RCT_CUSTOM_VIEW_PROPERTY(debug, BOOL, SkiaUIView) {
  bool debug = json != NULL ? [RCTConvert BOOL:json] : false;
  [(SkiaUIView *)view setDebugMode:debug];
}

RCT_CUSTOM_VIEW_PROPERTY(opaque, BOOL, SkiaUIView) {
  bool debug = json != NULL ? [RCTConvert BOOL:json] : false;
  [(SkiaUIView *)view setOpaque:debug];
}

- (UIView *)view {
  auto skManager = [[self skiaManager] skManager];
  // Pass SkManager as a raw pointer to avoid circular dependenciesr
  return [[SkiaUIView alloc]
      initWithManager:skManager.get()
              factory:[](std::shared_ptr<RNSkia::RNSkPlatformContext> context) {
                return std::make_shared<RNSkiOSView<RNSkia::RNSkDomView>>(
                    context);
              }];
}

@end
