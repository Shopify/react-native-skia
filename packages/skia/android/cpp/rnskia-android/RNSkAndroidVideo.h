#pragma once

#include <string>

#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

#include "RNSkVideo.h"

namespace RNSkia {

namespace jsi = facebook::jsi;
namespace jni = facebook::jni;

class RNSkAndroidVideo : public RNSkVideo {
private:
  jni::global_ref<jobject> _jniVideo;

public:
  explicit RNSkAndroidVideo(jni::global_ref<jobject> jniVideo);
  ~RNSkAndroidVideo() override;
  sk_sp<SkImage> nextImage(double *timeStamp = nullptr) override;
  double duration() override;
  double framerate() override;
  void seek(double timestamp) override;
  float getRotationInDegrees() override;
  SkISize getSize() override;
  void play() override;
  void pause() override;
  void setVolume(float volume) override;
};

} // namespace RNSkia
