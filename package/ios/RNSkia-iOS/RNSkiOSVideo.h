#pragma once

#include <string>

#include <AVFoundation/AVFoundation.h>
#include <CoreVideo/CoreVideo.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"
#include "include/core/SkSize.h"

#pragma clang diagnostic pop

#include "RNSkPlatformContext.h"
#include "RNSkVideo.h"

namespace RNSkia {

class RNSkiOSVideo : public RNSkVideo {
private:
  std::string _url;
  AVAssetReader *_reader = nullptr;
  AVAssetReaderTrackOutput *_trackOutput = nullptr;
  RNSkPlatformContext *_context;
  double _duration = 0;
  double _framerate = 0;
  float _videoWidth = 0;
  float _videoHeight = 0;
  void setupReader(CMTimeRange timeRange);
  NSDictionary *getOutputSettings();
  CGAffineTransform _preferredTransform;

public:
  RNSkiOSVideo(std::string url, RNSkPlatformContext *context);
  ~RNSkiOSVideo();
  sk_sp<SkImage> nextImage(double *timeStamp = nullptr) override;
  double duration() override;
  double framerate() override;
  void seek(double timestamp) override;
  float getRotationInDegrees() override;
  SkISize getSize() override;
};

} // namespace RNSkia
