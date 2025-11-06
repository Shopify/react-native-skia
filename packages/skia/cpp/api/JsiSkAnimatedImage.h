#pragma once

#include <algorithm>
#include <cmath>
#include <limits>
#include <memory>
#include <string>
#include <utility>

#include "JsiSkHostObjects.h"
#include "third_party/base64.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "JsiSkImage.h"
#include "include/codec/SkEncodedImageFormat.h"
#include "include/core/SkStream.h"

#include "include/android/SkAnimatedImage.h"
#include "include/codec/SkAndroidCodec.h"

#pragma clang diagnostic pop

#include <jsi/jsi.h>

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkAnimatedImage
    : public JsiSkWrappingSkPtrHostObject<SkAnimatedImage> {
public:
  // TODO-API: Properties?
  JSI_HOST_FUNCTION(getCurrentFrame) {
    auto image = getObject()->getCurrentFrame();
    auto hostObjectInstance =
        std::make_shared<JsiSkImage>(getContext(), std::move(image));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(getFrameCount) {
    return static_cast<int>(getObject()->getFrameCount());
  }

  JSI_HOST_FUNCTION(currentFrameDuration) {
    return static_cast<int>(getObject()->currentFrameDuration());
  }

  JSI_HOST_FUNCTION(decodeNextFrame) {
    return static_cast<int>(getObject()->decodeNextFrame());
  }

  EXPORT_JSI_API_TYPENAME(JsiSkAnimatedImage, AnimatedImage)

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkAnimatedImage, dispose),
                       JSI_EXPORT_FUNC(JsiSkAnimatedImage, getFrameCount),
                       JSI_EXPORT_FUNC(JsiSkAnimatedImage, getCurrentFrame),
                       JSI_EXPORT_FUNC(JsiSkAnimatedImage,
                                       currentFrameDuration),
                       JSI_EXPORT_FUNC(JsiSkAnimatedImage, decodeNextFrame))

  JsiSkAnimatedImage(std::shared_ptr<RNSkPlatformContext> context,
                     const sk_sp<SkAnimatedImage> image)
      : JsiSkWrappingSkPtrHostObject<SkAnimatedImage>(std::move(context),
                                                      std::move(image)) {}

  size_t getMemoryPressure() const override {
    auto animation = getObject();
    if (!animation) {
      return 0;
    }

    const auto safeMul = [](size_t a, size_t b) {
      if (a == 0 || b == 0) {
        return static_cast<size_t>(0);
      }
      if (std::numeric_limits<size_t>::max() / a < b) {
        return std::numeric_limits<size_t>::max();
      }
      return a * b;
    };

    const auto safeAdd = [](size_t a, size_t b) {
      if (std::numeric_limits<size_t>::max() - a < b) {
        return std::numeric_limits<size_t>::max();
      }
      return a + b;
    };

    SkRect bounds = animation->getBounds();
    auto width = std::max<SkScalar>(0, bounds.width());
    auto height = std::max<SkScalar>(0, bounds.height());
    size_t frameWidth =
        static_cast<size_t>(std::ceil(static_cast<double>(width)));
    size_t frameHeight =
        static_cast<size_t>(std::ceil(static_cast<double>(height)));

    size_t frameBytes = safeMul(safeMul(frameWidth, frameHeight),
                                static_cast<size_t>(4)); // RGBA bytes
    if (frameBytes == 0) {
      if (auto frame = animation->getCurrentFrame()) {
        auto frameInfo = frame->imageInfo();
        size_t bytesPerPixel = static_cast<size_t>(frameInfo.bytesPerPixel());
        if (bytesPerPixel == 0) {
          bytesPerPixel = 4;
        }
        frameBytes = safeMul(safeMul(static_cast<size_t>(frame->width()),
                                     static_cast<size_t>(frame->height())),
                             bytesPerPixel);
      }
    }

    if (frameBytes == 0) {
      return 0;
    }

    int frameCount = animation->getFrameCount();
    if (frameCount <= 0) {
      frameCount = 1;
    }

    // Animated images keep display, decoding, and restore frames resident.
    size_t cachedFrames =
        static_cast<size_t>(std::min(frameCount, 3)); // triple buffering
    size_t estimated = safeMul(frameBytes, cachedFrames);

    // Include codec/metadata overhead.
    estimated = safeAdd(estimated, 256 * 1024);

    return estimated;
  }

  std::string getObjectType() const override { return "JsiSkAnimatedImage"; }
};

} // namespace RNSkia
