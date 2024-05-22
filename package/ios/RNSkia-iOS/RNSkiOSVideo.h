#pragma once

#include <string>

#include <AVFoundation/AVFoundation.h>
#include <CoreVideo/CoreVideo.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

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
  void setupReader(CMTimeRange timeRange);
  NSDictionary *getOutputSettings();

public:
  RNSkiOSVideo(std::string url, RNSkPlatformContext *context);
  ~RNSkiOSVideo();
  sk_sp<SkImage> nextImage(double *timeStamp = nullptr) override;
  double duration() override;
  double framerate() override;
  void seek(double timestamp) override;
};

} // namespace RNSkia
