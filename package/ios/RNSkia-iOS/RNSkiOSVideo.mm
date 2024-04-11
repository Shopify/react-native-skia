#pragma once

#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"

#pragma clang diagnostic pop

#include "RNSkiOSVideo.h"

namespace RNSkia {

RNSkiOSVideo::RNSkiOSVideo(std::string url) {

}

sk_sp<SkImage> RNSkiOSVideo::nextImage(double *timeStamp) {
    return nullptr;
}

} // namespace RNSkia
