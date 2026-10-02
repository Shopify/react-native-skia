// Everything that needs a complete Recorder lives here rather than in
// RNSkPictureView.h (which platform views include on its own).
#include "RNSkPictureView.h"

#include <memory>
#include <utility>

#include "api/recorder/DrawingCtx.h"
#include "api/recorder/RNRecorder.h"

namespace RNSkia {

void drawContent(SkCanvas *canvas, Recorder *recorder,
                 const sk_sp<SkPicture> &picture, float pixelDensity) {
  canvas->clear(SK_ColorTRANSPARENT);
  canvas->save();
  canvas->scale(pixelDensity, pixelDensity);
  if (recorder != nullptr) {
    DrawingCtx ctx(canvas);
    recorder->play(&ctx);
  } else if (picture != nullptr) {
    canvas->drawPicture(picture);
  }
  canvas->restore();
}

void RNSkPictureRenderer::setRecorder(std::shared_ptr<Recorder> recorder) {
  sk_sp<SkPicture> picture;
  if (recorder != nullptr && recorder->variables.empty()) {
    picture = recorder->makePicture();
    recorder = nullptr;
  }
  std::shared_ptr<Recorder> retired;
  {
    std::lock_guard<std::mutex> lock(_mutex);
    retired = std::move(_recorder);
    _recorder = std::move(recorder);
    _picture = std::move(picture);
  }
  retired = nullptr;
  _requestRedraw();
}

bool RNSkPictureRenderer::applyUpdatesTo(
    const std::shared_ptr<Recorder> &recorder, jsi::Runtime &runtime,
    double recorderId, const jsi::Array &values) {
  if (recorder == nullptr || recorder->id != recorderId) {
    return false;
  }
  // The values are written into the commands by the next replay, which the
  // caller schedules: the mapper never waits for a draw.
  recorder->readUpdates(runtime, values);
  return true;
}

bool RNSkPictureRenderer::applyUpdates(jsi::Runtime &runtime, double recorderId,
                                       const jsi::Array &values) {
  std::shared_ptr<Recorder> recorder;
  {
    std::lock_guard<std::mutex> lock(_mutex);
    recorder = _recorder;
  }
  // Outside the renderer lock: a commit replacing the recorder must not wait
  // for the update. Should it land while this runs, the update goes into the
  // retired recorder and the redraw that follows draws the new one.
  return applyUpdatesTo(recorder, runtime, recorderId, values);
}

} // namespace RNSkia
