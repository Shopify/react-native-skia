#import "RNSkiOSPlatformContext.h"

#import <CoreMedia/CMSampleBuffer.h>
#import <React/RCTUtils.h>
#include <thread>
#include <utility>

#import "SkiaCVPixelBufferUtils.h"
#import "SkiaMetalSurfaceFactory.h"

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

OSType getCVPixelBufferPixelFormatForSkColorType(SkColorType colorType) {
  // iOS only supports 32BGRA and 32ARGB for RGB CVPixelBuffers. Other formats are not supported.
  switch (colorType) {
  case SkColorType::kBGRA_8888_SkColorType:
    return kCVPixelFormatType_32BGRA;
  default:
    throw std::runtime_error("Cannot convert unknown SkColorType #" +
                             std::to_string(colorType) +
                             " to CVPixelBuffer PixelFormat!");
  }
}

uint64_t RNSkiOSPlatformContext::makePlatformBuffer(sk_sp<SkImage> image) {
  if (image->colorType() != kBGRA_8888_SkColorType) {
    // on iOS, 32_BGRA is the only supported RGB format for CVPixelBuffers.
    image = image->makeColorTypeAndColorSpace(ThreadContextHolder::ThreadSkiaMetalContext.skContext.get(),
                                              kBGRA_8888_SkColorType,
                                              SkColorSpace::MakeSRGB());
    if (image == nullptr) {
      throw std::runtime_error("Failed to convert image to BGRA_8888 colortype! Only BGRA_8888 PlatformBuffers are supported.");
    }
  }
  
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
  OSType pixelFormatType =
      getCVPixelBufferPixelFormatForSkColorType(image->colorType());

  // You will need to fill in the details for creating the pixel buffer
  // CVPixelBufferCreateWithBytes or CVPixelBufferCreateWithPlanarBytes
  // Create the CVPixelBuffer with the image data
  void *context = static_cast<void *>(
      new sk_sp<SkData>(buf)); // Create a copy for the context
  CVReturn result = CVPixelBufferCreateWithBytes(
      nullptr, // allocator
      image->width(), image->height(), pixelFormatType,
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

  if (result != kCVReturnSuccess) {
    throw std::runtime_error("Failed to create CVPixelBuffer from SkImage! Return value: " + std::to_string(result));
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
    throw std::runtime_error("Failed to wrap CVPixelBuffer in CMSampleBuffer! Return value: " + std::to_string(status));
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
  return SkiaMetalSurfaceFactory::makeTextureFromCMSampleBuffer(sampleBuffer);
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
