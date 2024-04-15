#pragma once

#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

#include "RNSkVideo.h"

namespace RNSkia {

class RNSkAndroidVideo : public RNSkVideo {
private:
  std::string _url;

public:
  RNSkAndroidVideo(const std::string &url);
  ~RNSkAndroidVideo();
  sk_sp<SkImage> nextImage(double *timeStamp = nullptr) override;
};

} // namespace RNSkia
