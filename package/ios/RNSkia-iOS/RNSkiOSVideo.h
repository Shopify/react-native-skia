#pragma once

#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

#include "RNSkVideo.h"

namespace RNSkia {

class RNSkiOSVideo : public RNSkVideo {
public:
  RNSkiOSVideo(std::string url);
  ~RNSkiOSVideo() override {}
  sk_sp<SkImage> nextImage(double *timeStamp = nullptr) override;
};

} // namespace RNSkia
