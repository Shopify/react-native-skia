#pragma once

#include <memory>
#include <string>

#include <jni.h>
#include <jsi/jsi.h>
#include <fbjni/fbjni.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

#include "RNSkAndroidVideo.h"

namespace RNSkia {

namespace jsi = facebook::jsi;
namespace jni = facebook::jni;

RNSkAndroidVideo::RNSkAndroidVideo(const std::string &url)
    : _url(std::move(url)) {
  

}

RNSkAndroidVideo::~RNSkAndroidVideo() {}

sk_sp<SkImage> RNSkAndroidVideo::nextImage(double *timeStamp) {
  return nullptr;
}

} // namespace RNSkia

