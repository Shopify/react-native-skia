#include "RNSkiOSPlatformContext.h"

#import <CoreMedia/CMSampleBuffer.h>
#import <React/RCTUtils.h>
#include <thread>
#include <utility>

#include "SkiaMetalSurfaceFactory.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkBitmap.h"
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
  if (sampleBuffer) {
    CFRelease(sampleBuffer);
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
  CVReturn r = CVPixelBufferCreateWithBytes(
      nullptr, // allocator
      image->width(), image->height(), kCVPixelFormatType_32BGRA,
      pixelData,   // pixel data
      bytesPerRow, // bytes per row
      nullptr,     // release callback
      nullptr,     // release refCon
      nullptr,     // pixel buffer attributes
      &pixelBuffer // the newly created pixel buffer
  );

  // if (r != kCVReturnSuccess) {
  //     return 1; // or handle error appropriately
  // }

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
    // Handle error
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
  if (!CMSampleBufferIsValid(sampleBuffer)) {
    throw std::runtime_error("The given CMSampleBuffer is not valid!");
  }

  CVPixelBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
  double width = CVPixelBufferGetWidth(pixelBuffer);
  double height = CVPixelBufferGetHeight(pixelBuffer);

  // Make sure the format is RGB (BGRA_8888)
  OSType format = CVPixelBufferGetPixelFormatType(pixelBuffer);
  if (format != kCVPixelFormatType_32BGRA) {
    auto error = std::string(
        "CMSampleBuffer has unknown Pixel Format - cannot convert to SkImage!");
    throw std::runtime_error(error);
  }

  CVPixelBufferLockBaseAddress(pixelBuffer, 0);
  void *pixelData = CVPixelBufferGetBaseAddress(pixelBuffer);

  // Create SkImage from pixel data
  SkBitmap bitmap;
  bitmap.installPixels(SkImageInfo::MakeN32Premul(width, height), pixelData,
                       CVPixelBufferGetBytesPerRow(pixelBuffer));
  sk_sp<SkImage> image = SkImages::RasterFromBitmap(bitmap);

  CVPixelBufferUnlockBaseAddress(pixelBuffer, 0);

  return image;
  // return SkiaMetalSurfaceFactory::makeImageFromCMSampleBuffer(sampleBuffer);
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
