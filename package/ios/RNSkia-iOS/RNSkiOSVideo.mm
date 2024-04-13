#pragma once

#include <memory>
#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

#include "RNSkiOSVideo.h"
#include <AVFoundation/AVFoundation.h>
#include <CoreVideo/CoreVideo.h>

namespace RNSkia {

RNSkiOSVideo::RNSkiOSVideo(std::string url, RNSkPlatformContext *context)
    : _url(std::move(url)), _context(context) {
  initializeReader();
}

RNSkiOSVideo::~RNSkiOSVideo() {}

void RNSkiOSVideo::initializeReader() {
  NSError *error = nil;

  AVURLAsset *asset =
      [AVURLAsset URLAssetWithURL:[NSURL URLWithString:@(_url.c_str())]
                          options:nil];
  AVAssetReader *assetReader = [[AVAssetReader alloc] initWithAsset:asset
                                                              error:&error];

  if (error) {
    NSLog(@"Error initializing asset reader: %@", error.localizedDescription);
    return;
  }

  AVAssetTrack *videoTrack =
      [[asset tracksWithMediaType:AVMediaTypeVideo] firstObject];
  NSDictionary *outputSettings = @{
    (id)kCVPixelBufferPixelFormatTypeKey : @(kCVPixelFormatType_32BGRA),
    (id)kCVPixelBufferMetalCompatibilityKey : @YES
  };
  AVAssetReaderTrackOutput *trackOutput =
      [[AVAssetReaderTrackOutput alloc] initWithTrack:videoTrack
                                       outputSettings:outputSettings];

  if ([assetReader canAddOutput:trackOutput]) {
    [assetReader addOutput:trackOutput];
    [assetReader startReading];
  } else {
    NSLog(@"Cannot add output to asset reader.");
    return;
  }

  _reader = assetReader;
  _trackOutput = trackOutput;
}

sk_sp<SkImage> RNSkiOSVideo::nextImage(double *timeStamp) {
  CMSampleBufferRef sampleBuffer = [_trackOutput copyNextSampleBuffer];
  if (!sampleBuffer) {
    NSLog(@"No more sample buffers.");
    return nullptr;
  }

  //    CVPixelBufferRef imageBuffer =
  //    CMSampleBufferGetImageBuffer(sampleBuffer); if (!imageBuffer) {
  //        NSLog(@"Failed to get image buffer from sample buffer.");
  //        CFRelease(sampleBuffer);
  //        return nullptr;
  //    }
  // Assuming makeSkiaImageFromCVBuffer is defined and converts a
  // CVPixelBufferRef to sk_sp<SkImage>
  auto skImage = _context->makeImageFromNativeBuffer(
      reinterpret_cast<void *>(sampleBuffer));

  if (timeStamp) {
    CMTime time = CMSampleBufferGetPresentationTimeStamp(sampleBuffer);
    *timeStamp = CMTimeGetSeconds(time);
  }

  CFRelease(sampleBuffer);
  return skImage;
}

} // namespace RNSkia

// Remember to define makeSkiaImageFromCVBuffer somewhere in your project.
