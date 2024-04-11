#include "RNSkiOSPlatformContext.h"

#import <CoreMedia/CMSampleBuffer.h>
#import <React/RCTUtils.h>
#include <thread>
#include <utility>

#include "SkiaMetalSurfaceFactory.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkFontMgr.h"
#include "include/core/SkSurface.h"

#include "include/ports/SkFontMgr_mac_ct.h"

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

void RNSkiOSPlatformContext::releasePlatformBuffer(uint64_t pointer) {
  CMSampleBufferRef sampleBuffer = reinterpret_cast<CMSampleBufferRef>(pointer);
  CVPixelBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
  if (sampleBuffer) {
    CFRelease(sampleBuffer);
  }
  if (pixelBuffer) {
    CFRelease(pixelBuffer);
  }
}

uint64_t RNSkiOSPlatformContext::makePlatformBuffer(sk_sp<SkImage> image) {
  auto bytesPerPixel = image->imageInfo().bytesPerPixel();
  int bytesPerRow = image->width() * bytesPerPixel;
  auto buf = SkData::MakeUninitialized(image->width() * image->height() *
                                       bytesPerPixel);
  SkImageInfo info = SkImageInfo::Make(image->width(), image->height(),
                                       image->colorType(), image->alphaType());
  image->readPixels(nullptr, info, const_cast<void *>(buf->data()), bytesPerRow,
                    0, 0);
  auto pixelData = const_cast<void *>(buf->data());

  // Create a CVPixelBuffer from the raw pixel data
  CVPixelBufferRef pixelBuffer = nullptr;
  // OSType pixelFormatType = MapSkColorTypeToOSType(image->colorType());

  // You will need to fill in the details for creating the pixel buffer
  // CVPixelBufferCreateWithBytes or CVPixelBufferCreateWithPlanarBytes
  // Create the CVPixelBuffer with the image data
  void *context = static_cast<void *>(
      new sk_sp<SkData>(buf)); // Create a copy for the context
  CVReturn r = CVPixelBufferCreateWithBytes(
      nullptr, // allocator
      image->width(), image->height(), kCVPixelFormatType_32BGRA,
      pixelData,                                         // pixel data
      bytesPerRow,                                       // bytes per row
      [](void *releaseRefCon, const void *baseAddress) { // release callback
        auto buf = static_cast<sk_sp<SkData> *>(releaseRefCon);
        buf->reset(); // This effectively calls unref on the SkData object
        delete buf;   // Cleanup the dynamically allocated context
      },
      context,     // release callback context
      nullptr,     // pixel buffer attributes
      &pixelBuffer // the newly created pixel buffer
  );

  if (r != kCVReturnSuccess) {
    return 0; // or handle error appropriately
  }

  // Wrap the CVPixelBuffer in a CMSampleBuffer
  CMSampleBufferRef sampleBuffer = nullptr;

  CMFormatDescriptionRef formatDescription = nullptr;
  CMVideoFormatDescriptionCreateForImageBuffer(kCFAllocatorDefault, pixelBuffer,
                                               &formatDescription);

  // Assuming no specific timing is required, we initialize the timing info to
  // zero.
  CMSampleTimingInfo timingInfo = {0};
  timingInfo.duration = kCMTimeInvalid; // Indicate an unknown duration.
  timingInfo.presentationTimeStamp = kCMTimeZero; // Start at time zero.
  timingInfo.decodeTimeStamp = kCMTimeInvalid;    // No specific decode time.

  // Create the sample buffer.
  OSStatus status = CMSampleBufferCreateReadyWithImageBuffer(
      kCFAllocatorDefault, pixelBuffer, formatDescription, &timingInfo,
      &sampleBuffer);

  if (status != noErr) {
    if (formatDescription) {
      CFRelease(formatDescription);
    }
    if (pixelBuffer) {
      CFRelease(pixelBuffer);
    }
    return 0;
  }

  // Return sampleBuffer casted to uint64_t
  return reinterpret_cast<uint64_t>(sampleBuffer);
}

void RNSkiOSPlatformContext::raiseError(const std::exception &err) {
  RCTFatal(RCTErrorWithMessage([NSString stringWithUTF8String:err.what()]));
}

sk_sp<SkSurface> RNSkiOSPlatformContext::makeOffscreenSurface(int width,
                                                              int height) {
  return SkiaMetalSurfaceFactory::makeOffscreenSurface(width, height);
}

sk_sp<SkImage>
RNSkiOSPlatformContext::makeImageFromPlatformBuffer(void *buffer) {
  CMSampleBufferRef sampleBuffer = (CMSampleBufferRef)buffer;
  // DO the CPU transfer (debugging only)
  //  Step 1: Extract the CVPixelBufferRef from the CMSampleBufferRef
  CVPixelBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);

  // Step 2: Lock the pixel buffer to access the raw pixel data
  CVPixelBufferLockBaseAddress(pixelBuffer, 0);

  // Step 3: Get information about the image
  void *baseAddress = CVPixelBufferGetBaseAddress(pixelBuffer);
  size_t width = CVPixelBufferGetWidth(pixelBuffer);
  size_t height = CVPixelBufferGetHeight(pixelBuffer);
  size_t bytesPerRow = CVPixelBufferGetBytesPerRow(pixelBuffer);

  // Assuming the pixel format is 32BGRA, which is common for iOS video frames.
  // You might need to adjust this based on the actual pixel format.
  SkImageInfo info = SkImageInfo::Make(width, height, kRGBA_8888_SkColorType,
                                       kUnpremul_SkAlphaType);

  // Step 4: Create an SkImage from the pixel buffer
  sk_sp<SkData> data =
      SkData::MakeWithoutCopy(baseAddress, height * bytesPerRow);
  sk_sp<SkImage> image = SkImages::RasterFromData(info, data, bytesPerRow);
  auto texture = SkiaMetalSurfaceFactory::makeTextureFromImage(image);
  // Step 5: Unlock the pixel buffer
  CVPixelBufferUnlockBaseAddress(pixelBuffer, 0);
  return texture;
}

sk_sp<SkFontMgr> RNSkiOSPlatformContext::createFontMgr() {
  return SkFontMgr_New_CoreText(nullptr);
}

void RNSkiOSPlatformContext::runOnMainThread(std::function<void()> func) {
  dispatch_async(dispatch_get_main_queue(), ^{
    func();
  });
}

sk_sp<SkImage>
RNSkiOSPlatformContext::takeScreenshotFromViewTag(size_t viewTag) {
  return [_screenshotService
      screenshotOfViewWithTag:[NSNumber numberWithLong:viewTag]];
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
