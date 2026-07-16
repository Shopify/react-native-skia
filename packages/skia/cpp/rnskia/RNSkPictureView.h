#pragma once

#include <functional>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <variant>
#include <vector>

#include <jsi/jsi.h>

#include "RNSkView.h"
#include "jsi/ViewProperty.h"

#include "RNSkPlatformContext.h"
#include "api/JsiSkPicture.h"
#include "utils/RNSkLog.h"
#include "utils/RNSkTimingInfo.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkBBHFactory.h"
#include "include/core/SkCanvas.h"
#include "include/core/SkPictureRecorder.h"

#pragma clang diagnostic pop

class SkPicture;
struct SkRect;
class SkImage;

namespace RNSkia {

namespace jsi = facebook::jsi;

class RNSkPictureRenderer
    : public RNSkRenderer,
      public std::enable_shared_from_this<RNSkPictureRenderer> {
public:
  RNSkPictureRenderer(std::function<void()> requestRedraw,
                      std::shared_ptr<RNSkPlatformContext> context)
      : RNSkRenderer(std::move(requestRedraw)),
        _platformContext(std::move(context)) {}

  virtual ~RNSkPictureRenderer() = default;

  void
  renderImmediate(std::shared_ptr<RNSkCanvasProvider> canvasProvider) override {
    performDraw(canvasProvider);
  }

  void setPicture(sk_sp<SkPicture> picture) {
    {
      std::lock_guard<std::mutex> lock(_pictureMutex);
      _picture.swap(picture);
    }
    // The previous picture (now held by the local) is released outside the
    // lock: if this is the last reference, its destruction can be arbitrarily
    // expensive and must not extend the critical section.
    picture.reset();
    _requestRedraw();
  }

  sk_sp<SkPicture> getPicture() const {
    std::lock_guard<std::mutex> lock(_pictureMutex);
    return _picture;
  }

private:
  bool performDraw(std::shared_ptr<RNSkCanvasProvider> canvasProvider) {
    // _picture is swapped from whichever thread runs setJsiProperty (JS
    // thread, or the Reanimated UI runtime) while this method runs on the
    // main thread (redraws) or the JS thread (makeImageSnapshot). Copying an
    // sk_sp is not atomic (pointer load + ref increment), so the copy must
    // be mutually exclusive with the swap.
    sk_sp<SkPicture> picture = getPicture();
    auto pd = _platformContext->getPixelDensity();
    return canvasProvider->renderToCanvas([=](SkCanvas *canvas) {
      canvas->clear(SK_ColorTRANSPARENT);
      canvas->save();
      canvas->scale(pd, pd);
      if (picture != nullptr) {
        canvas->drawPicture(picture);
      }
      canvas->restore();
    });
  }

  std::shared_ptr<RNSkPlatformContext> _platformContext;
  // Guards _picture: written and read from different threads (see
  // performDraw).
  mutable std::mutex _pictureMutex;
  sk_sp<SkPicture> _picture;
};

class RNSkPictureView : public RNSkView {
public:
  /**
   * Constructor
   */
  RNSkPictureView(std::shared_ptr<RNSkPlatformContext> context,
                  std::shared_ptr<RNSkCanvasProvider> canvasProvider)
      : RNSkView(
            context, canvasProvider,
            std::make_shared<RNSkPictureRenderer>(
                std::bind(&RNSkPictureView::requestRedraw, this), context)) {}

  void setJsiProperties(
      std::unordered_map<std::string, RNJsi::ViewProperty> &props) override {
    // Base implementation
    for (auto &prop : props) {
      if (prop.first == "picture") {
        if (prop.second.isNull()) {
          // Clear picture
          std::static_pointer_cast<RNSkPictureRenderer>(getRenderer())
              ->setPicture(nullptr);
          continue;
        }
        // Save picture
        std::static_pointer_cast<RNSkPictureRenderer>(getRenderer())
            ->setPicture(prop.second.getPicture());
      }
    }
  }
};
} // namespace RNSkia
