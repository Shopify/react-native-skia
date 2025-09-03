#pragma once

#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

namespace RNSkia {

class RNSkVideo {
public:
  virtual ~RNSkVideo() = default;
  virtual sk_sp<SkImage> nextImage(double *timeStamp = nullptr) = 0;
  virtual double duration() = 0;
  virtual double framerate() = 0;
  virtual void seek(double timestamp) = 0;
  virtual float getRotationInDegrees() = 0;
  virtual SkISize getSize() = 0;
  virtual void play() = 0;
  virtual void pause() = 0;
  virtual void setVolume(float volume) = 0;
};

} // namespace RNSkia
