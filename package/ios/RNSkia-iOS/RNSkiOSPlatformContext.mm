#include "RNSkiOSPlatformContext.h"

#import <React/RCTUtils.h>
#include <thread>
#include <utility>

#include <RNSkMeasureTime.h>
#include <SkiaMetalRenderer.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkSurface.h"

#pragma clang diagnostic pop

namespace RNSkia {

void RNSkiOSPlatformContext::performStreamOperation(
    const std::string &sourceUri,
    const std::function<void(std::unique_ptr<SkStreamAsset>)> &op) {

  RNSkMeasureTime("PlatformContext::performStreamOperation");
  auto loader = [=]() {
    NSURL *url = [[NSURL alloc]
        initWithString:[NSString stringWithUTF8String:sourceUri.c_str()]];

    NSData *data = nullptr;
    auto scheme = url.scheme;
    auto extension = url.pathExtension;

    if (scheme == nullptr &&
        (extension == nullptr || [extension isEqualToString:@""])) {
      // Load from bundle? We accept loading png images from bundle - nothing
      // else. The reason is that React Native loads images from bundles through
      // name by adding the png extension. We don't know if we're loading an
      // image or data here, but if the scheme is empty and the extension is
      // empty it is safe to assume that we're trying to load from the bundle
      // and we can therefore append the png extension if no extension is set.
      auto image = [UIImage imageNamed:[url absoluteString]];
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
