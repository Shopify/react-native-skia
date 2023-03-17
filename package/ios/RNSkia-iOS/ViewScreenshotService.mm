#import "ViewScreenshotService.h"
#import <QuartzCore/QuartzCore.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkData.h"

#pragma clang diagnostic pop

@implementation ViewScreenshotService {
  RCTUIManager *_uiManager;
}

- (instancetype)initWithUiManager:(RCTUIManager *)uiManager {
  if (self = [super init]) {
    _uiManager = uiManager;
  }
  return self;
}

- (sk_sp<SkImage>)screenshotOfViewWithTag:(NSNumber *)viewTag {
  // Find view corresponding to the tag
  auto view = [_uiManager viewForReactTag:viewTag];
  if (view == NULL) {
    RCTFatal(RCTErrorWithMessage(@"Could not find view with tag"));
  }

  // Get size
  auto size = view.frame.size;

  // Setup contextr
  UIGraphicsBeginImageContextWithOptions(size, NO, 0);

  // Render to context
  //[view.layer renderInContext:UIGraphicsGetCurrentContext()];
  [view drawViewHierarchyInRect:(CGRect){CGPointZero, size}
             afterScreenUpdates:YES];

  // Convert to image and release context
  UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
  UIGraphicsEndImageContext();

  // Convert to SkImage
  NSData *data = UIImagePNGRepresentation(image);
  sk_sp<SkData> skData = SkData::MakeWithCopy(data.bytes, data.length);
  return SkImage::MakeFromEncoded(skData);
}

@end
