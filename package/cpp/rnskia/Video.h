#pragma once

#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

namespace RNSkia {

class Video {
public:
  virtual ~Video() = default;
  sk_sp<SkImage> nextImage(double* timeStamp = nullptr);
};

} // namespace RNSkia
