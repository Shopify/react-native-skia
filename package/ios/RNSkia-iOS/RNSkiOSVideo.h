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
  AVPlayer* _player;
  AVPlayerItemVideoOutput* _videoOutput;
  RNSkPlatformContext *_context;

public:
  RNSkiOSVideo(std::string url, RNSkPlatformContext *context);
  ~RNSkiOSVideo();
  sk_sp<SkImage> nextImage(double *timeStamp = nullptr) override;

  // Rename to initializePlayer
  void initializeReader();
};

} // namespace RNSkia
