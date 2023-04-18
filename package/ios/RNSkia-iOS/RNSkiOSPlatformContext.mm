#include "RNSkiOSPlatformContext.h"

#import <React/RCTUtils.h>
#import <Foundation/Foundation.h>
#import <CoreText/CoreText.h>

#include <thread>
#include <utility>

#include <SkiaMetalRenderer.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkSurface.h"


#pragma clang diagnostic pop

namespace RNSkia {

void RNSkiOSPlatformContext::performStreamOperation(
    const std::string &sourceUri,
    const std::function<void(std::unique_ptr<SkStreamAsset>)> &op) {

  auto loader = [=]() {
    NSURL *url = [[NSURL alloc]
        initWithString:[NSString stringWithUTF8String:sourceUri.c_str()]];

    NSData *data = nullptr;
    auto scheme = url.scheme;
    auto extension = url.pathExtension;

    if (scheme == nullptr &&
        (extension == nullptr || [extension isEqualToString:@""])) {
      // If the extension and scheme is nil, we assume that we're trying to
      // load from the embedded iOS app bundle and will try to load image
      // and get data from the image directly. imageNamed will return the
      // best version of the requested image:
      auto image = [UIImage imageNamed:[url absoluteString]];
      // We don't know the image format (png, jpg, etc) but
      // UIImagePNGRepresentation will support all of them
      data = UIImagePNGRepresentation(image);
    } else {
      // Load from metro / node
      data = [NSData dataWithContentsOfURL:url];
    }

    auto bytes = [data bytes];
    auto skData = SkData::MakeWithCopy(bytes, [data length]);
    auto stream = SkMemoryStream::Make(skData);

    op(std::move(stream));
  };

  // Fire and forget the thread - will be resolved on completion
  std::thread(loader).detach();
}

void RNSkiOSPlatformContext::raiseError(const std::exception &err) {
  RCTFatal(RCTErrorWithMessage([NSString stringWithUTF8String:err.what()]));
}

sk_sp<SkSurface> RNSkiOSPlatformContext::makeOffscreenSurface(int width,
                                                              int height) {
  return MakeOffscreenMetalSurface(width, height);
}

sk_sp<SkTypeface> RNSkiOSPlatformContext::getTypeFace(const std::string &familyName) {
  // Get the font descriptor for a specific system font
  auto fontDescriptor = CTFontDescriptorCreateWithNameAndSize(CFStringCreateWithCString(kCFAllocatorDefault, familyName.c_str(), kCFStringEncodingUTF8), 0.0);

  // If the font descriptor is null, the font was not found
  if (!fontDescriptor) {
      return nil;
  }

  // Get the URL of the font file
  CFURLRef fontURL = (CFURLRef)CTFontDescriptorCopyAttribute(fontDescriptor, kCTFontURLAttribute);
  CFRelease(fontDescriptor);

  // If the URL is null, there was an error getting the font file
  if (!fontURL) {
      return nil;
  }

  // Read the font data into an NSData object
  NSData *fontData = [NSData dataWithContentsOfURL:(__bridge NSURL *)fontURL];
  CFRelease(fontURL);

  auto bytes = [fontData bytes];
  auto data = SkData::MakeWithCopy(bytes, [fontData length]);
  auto typeface = SkTypeface::MakeFromData(data);
  return typeface;
}

void RNSkiOSPlatformContext::startDrawLoop() {
  if (_displayLink == nullptr) {
    _displayLink = [[DisplayLink alloc] init];
    [_displayLink start:^(double time) {
      notifyDrawLoop(false);
    }];
  }
}

void RNSkiOSPlatformContext::stopDrawLoop() {
  if (_displayLink != nullptr) {
    [_displayLink stop];
    _displayLink = nullptr;
  }
}

} // namespace RNSkia
