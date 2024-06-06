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
  setupReader(CMTimeRangeMake(kCMTimeZero, kCMTimePositiveInfinity));
}

RNSkiOSVideo::~RNSkiOSVideo() {}

void RNSkiOSVideo::setupReader(CMTimeRange timeRange) {
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

  CMTime time = [asset duration];
  if (time.timescale == 0) {
    NSLog(@"Error: Timescale of the asset is zero.");
    return;
  }

  _duration = CMTimeGetSeconds(time) * 1000; // Store duration in milliseconds
  AVAssetTrack *videoTrack =
      [[asset tracksWithMediaType:AVMediaTypeVideo] firstObject];
  _framerate = videoTrack.nominalFrameRate;
  _preferredTransform = videoTrack.preferredTransform;

  NSDictionary *outputSettings = getOutputSettings();
  AVAssetReaderTrackOutput *trackOutput =
      [[AVAssetReaderTrackOutput alloc] initWithTrack:videoTrack
                                       outputSettings:outputSettings];

  assetReader.timeRange = timeRange;
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
    NSLog(@"No sample buffer.");
    return nullptr;
  }

  // Extract the pixel buffer from the sample buffer
  CVPixelBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
  if (!pixelBuffer) {
    NSLog(@"No pixel buffer.");
    CFRelease(sampleBuffer);
    return nullptr;
  }

  auto skImage = _context->makeImageFromNativeBuffer(
      reinterpret_cast<void *>(pixelBuffer));

  if (timeStamp) {
    CMTime time = CMSampleBufferGetPresentationTimeStamp(sampleBuffer);
    *timeStamp = CMTimeGetSeconds(time);
  }

  CFRelease(sampleBuffer);
  return skImage;
}

NSDictionary *RNSkiOSVideo::getOutputSettings() {
  return @{
    (id)kCVPixelBufferPixelFormatTypeKey : @(kCVPixelFormatType_32BGRA),
    (id)kCVPixelBufferMetalCompatibilityKey : @YES
  };
}

float RNSkiOSVideo::getRotationInDegrees() {
  CGFloat rotationAngle = 0.0;
  auto transform = _preferredTransform;
  // Determine the rotation angle in radians
  if (transform.a == 0 && transform.b == 1 && transform.c == -1 &&
      transform.d == 0) {
    rotationAngle = M_PI_2; // 90 degrees
  } else if (transform.a == 0 && transform.b == -1 && transform.c == 1 &&
             transform.d == 0) {
    rotationAngle = -M_PI_2; // -90 degrees
  } else if (transform.a == -1 && transform.b == 0 && transform.c == 0 &&
             transform.d == -1) {
    rotationAngle = M_PI; // 180 degrees
  } else if (transform.a == 1 && transform.b == 0 && transform.c == 0 &&
             transform.d == 1) {
    rotationAngle = 0.0; // 0 degrees
  }
  // Convert the rotation angle from radians to degrees
  return rotationAngle * 180 / M_PI;
}

void RNSkiOSVideo::seek(double timeInMilliseconds) {
  if (_reader) {
    [_reader cancelReading];
    _reader = nil;
    _trackOutput = nil;
  }

  CMTime startTime =
      CMTimeMakeWithSeconds(timeInMilliseconds / 1000.0, NSEC_PER_SEC);
  CMTimeRange timeRange = CMTimeRangeMake(startTime, kCMTimePositiveInfinity);
  setupReader(timeRange);
}

double RNSkiOSVideo::duration() { return _duration; }

double RNSkiOSVideo::framerate() { return _framerate; }

} // namespace RNSkia
