#pragma once

#include <string>

#include <android/native_window_jni.h>
#include <media/NdkMediaCodec.h>
#include <media/NdkMediaExtractor.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkData.h"
#include "include/core/SkImage.h"

#pragma clang diagnostic pop

#include "RNSkVideo.h"

namespace RNSkia {

class RNSkAndroidVideo : public RNSkVideo {
private:
  FILE *fp;
  AMediaExtractor *extractor;
  AMediaCodec *codec;
  AMediaFormat *format;
  ANativeWindow *window;
  size_t videoTrackIndex;
  bool isExtractorAtEnd = false;
  int32_t width;
  int32_t height;

  void initializeDecoder(const std::string &url);

public:
  explicit RNSkAndroidVideo(const std::string &url);
  ~RNSkAndroidVideo();
  sk_sp<SkImage> nextImage(double *timeStamp = nullptr) override;
};

} // namespace RNSkia
