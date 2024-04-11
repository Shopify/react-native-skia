#pragma once

#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

#include "Video.h"

namespace RNSkia {

class RNSkiOSVideo: public Video {
public:
  RNSkiOSVideo(std::string url);

  sk_sp<SkImage> nextImage(double* timeStamp = nullptr);
};

} // namespace RNSkia
