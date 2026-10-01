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

class Recorder;

/**
 * Draws either an SkPicture (imperative API, static container) or a Recorder
 * (declarative <Canvas> with Reanimated). The recorder is owned by the
 * renderer, not by a JS wrapper: its commands hold every native resource the
 * canvas draws (images, pictures, paths), and tying their lifetime to the
 * garbage collector of a runtime that rarely allocates (the UI runtime) kept
 * them resident long after unmount. Here they are released as soon as the
 * recorder is replaced or cleared.
 */
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
      std::lock_guard<std::mutex> lock(_mutex);
      _picture = picture;
      _recorder = nullptr;
    }
    _requestRedraw();
  }

  sk_sp<SkPicture> getPicture() const {
    std::lock_guard<std::mutex> lock(_mutex);
    return _picture;
  }

  /**
   * Takes ownership of a recorder. The previous recorder (and the resources
   * its commands reference) is released here; Recorder's destructor moves
   * the commands to the main thread before destroying them so GPU-backed
   * resources are freed on the thread that used them.
   */
  void setRecorder(std::shared_ptr<Recorder> recorder) {
    std::shared_ptr<Recorder> retired;
    {
      std::lock_guard<std::mutex> lock(_mutex);
      retired = std::move(_recorder);
      _recorder = std::move(recorder);
      _picture = nullptr;
    }
    retired = nullptr;
    _requestRedraw();
  }

  /**
   * Reads the shared values on the calling runtime into the recorder's
   * commands. Returns false when there is no recorder to update.
   */
  bool applyUpdates(jsi::Runtime &runtime, const jsi::Array &values);

  /**
   * Extracts the native recorder from a JS Recorder object, or nullptr.
   */
  static std::shared_ptr<Recorder> recorderFromValue(jsi::Runtime &runtime,
                                                     const jsi::Value &value);

  /**
   * Draws the current content (recorder or picture) into the canvas, scaled
   * by the pixel density. Used for onscreen draws, snapshots and the Android
   * bitmap export.
   */
  void drawInto(SkCanvas *canvas, float pixelDensity) {
    // Hold the lock for the whole draw: the recorder's commands are mutated
    // by applyUpdates() and swapped by setRecorder() from other threads.
    std::lock_guard<std::mutex> lock(_mutex);
    canvas->clear(SK_ColorTRANSPARENT);
    canvas->save();
    canvas->scale(pixelDensity, pixelDensity);
    if (_recorder != nullptr) {
      replay(canvas, _recorder.get());
    } else if (_picture != nullptr) {
      canvas->drawPicture(_picture);
    }
    canvas->restore();
  }

private:
  void replay(SkCanvas *canvas, Recorder *recorder);

  bool performDraw(std::shared_ptr<RNSkCanvasProvider> canvasProvider) {
    auto pd = _platformContext->getPixelDensity();
    return canvasProvider->renderToCanvas(
        [this, pd](SkCanvas *canvas) { drawInto(canvas, pd); });
  }

  std::shared_ptr<RNSkPlatformContext> _platformContext;
  mutable std::mutex _mutex;
  sk_sp<SkPicture> _picture;
  std::shared_ptr<Recorder> _recorder;
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
    auto renderer =
        std::static_pointer_cast<RNSkPictureRenderer>(getRenderer());
    for (auto &prop : props) {
      if (prop.first == "picture") {
        renderer->setPicture(prop.second.isPicture() ? prop.second.getPicture()
                                                     : nullptr);
      } else if (prop.first == "recorder") {
        renderer->setRecorder(
            prop.second.isRecorder() ? prop.second.getRecorder() : nullptr);
      }
    }
  }
};
} // namespace RNSkia
