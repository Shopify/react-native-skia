#pragma once

#include <memory>
#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

#include "RNSkAndroidVideo.h"
#include "RNSkAndroidPlatformContext.h"

namespace RNSkia {

RNSkAndroidVideo::RNSkAndroidVideo(std::string url, RNSkPlatformContext *context)
    : _url(std::move(url)), _context(context) {
}

RNSkAndroidVideo::~RNSkAndroidVideo() {}

sk_sp<SkImage> RNSkAndroidVideo::nextImage(double *timeStamp) {
  return nullptr;
}

} // namespace RNSkia

