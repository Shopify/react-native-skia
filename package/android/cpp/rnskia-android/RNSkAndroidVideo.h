#pragma once

#include <string>

#include <jni.h>
#include <jsi/jsi.h>
#include <fbjni/fbjni.h>

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
  RNSkAndroidVideo(jni::global_ref<jobject> jniVideo);
  ~RNSkAndroidVideo();
  sk_sp<SkImage> nextImage(double *timeStamp = nullptr) override;
  double duration() override;
  double framerate() override;
  void seek(double timestamp) override;
};

} // namespace RNSkia
