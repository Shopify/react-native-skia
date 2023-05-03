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
  CGSize size = view.frame.size;

  // Setup context
  UIGraphicsImageRendererFormat *format =
      [UIGraphicsImageRendererFormat defaultFormat];
  format.opaque = NO;
  UIGraphicsImageRenderer *renderer =
      [[UIGraphicsImageRenderer alloc] initWithSize:size format:format];

  // Render to context - this is now the only part of this function that shows
  // up in the profiler!
  UIImage *image = [renderer
      imageWithActions:^(UIGraphicsImageRendererContext *_Nonnull context) {
        [view drawViewHierarchyInRect:(CGRect){CGPointZero, size}
                   afterScreenUpdates:YES];
      }];

  // Convert from UIImage -> CGImage -> SkImage
  CGImageRef cgImage = image.CGImage;

  // Get some info about the image
  auto width = CGImageGetWidth(cgImage);
  auto height = CGImageGetHeight(cgImage);
  auto bytesPerRow = CGImageGetBytesPerRow(cgImage);

  // Convert from UIImage -> SkImage, start by getting the pixels directly from
  // the CGImage:
  auto dataRef = CGDataProviderCopyData(CGImageGetDataProvider(cgImage));
  auto length = CFDataGetLength(dataRef);
  void *data = CFDataGetMutableBytePtr((CFMutableDataRef)dataRef);

  // Now we'll capture the data in an SkData object and control releasing it:
  auto skData = SkData::MakeWithProc(
      data, length,
      [](const void *ptr, void *context) {
        CFDataRef dataRef = (CFDataRef)context;
        CFRelease(dataRef);
      },
      (void *)dataRef);

  // Make SkImageInfo
  SkImageInfo info =
      SkImageInfo::Make(static_cast<int>(width), static_cast<int>(height),
                        kRGBA_8888_SkColorType, kPremul_SkAlphaType);

  // ... and then create the SkImage itself!
  return SkImage::MakeRasterData(info, skData, bytesPerRow);
}

@end
