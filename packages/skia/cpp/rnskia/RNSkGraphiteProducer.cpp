// Everything that needs a complete Recorder lives here rather than in
// RNSkGraphiteProducer.h (which the view headers include on their own).
#include "RNSkGraphiteProducer.h"

#include <memory>
#include <utility>

#include "RNSkGraphiteTarget.h"
#include "RNSkThreadPool.h"
#include "api/recorder/DrawingCtx.h"
#include "api/recorder/RNRecorder.h"
#include "utils/RNSkLog.h"

#include "include/core/SkCanvas.h"
#include "include/core/SkPicture.h"

namespace RNSkia {

RNSkGraphiteProducer::RNSkGraphiteProducer(ReplayPacing pacing)
    : _schedule(pacing) {}

RNSkGraphiteProducer::~RNSkGraphiteProducer() = default;

void RNSkGraphiteProducer::drawContent(SkCanvas *canvas, Recorder *recorder,
                                       const sk_sp<SkPicture> &picture,
                                       float pixelDensity) {
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

void RNSkGraphiteProducer::setTarget(
    std::shared_ptr<RNSkGraphiteTarget> target) {
  std::shared_ptr<RNSkGraphiteTarget> retiredTarget;
  {
    std::lock_guard<std::mutex> lock(_mutex);
    retiredTarget = std::exchange(_target, std::move(target));
    // A target never drops a recording (see produce()): the deferred one goes
    // to the target it was made for.
    if (auto deferred = _schedule.retarget()) {
      retiredTarget->submit(std::move(*deferred));
    }
    _dirty = true;
    kickLocked();
  }
}

void RNSkGraphiteProducer::setRecorder(std::shared_ptr<Recorder> recorder) {
  sk_sp<SkPicture> picture;
  if (recorder != nullptr && recorder->variables.empty()) {
    picture = recorder->makePicture();
    recorder = nullptr;
  }
  replaceContent(std::move(recorder), std::move(picture), /* dirty= */ true);
}

void RNSkGraphiteProducer::setPicture(sk_sp<SkPicture> picture) {
  replaceContent(nullptr, std::move(picture), /* dirty= */ true);
}

void RNSkGraphiteProducer::replaceContent(std::shared_ptr<Recorder> recorder,
                                          sk_sp<SkPicture> picture,
                                          bool dirty) {
  std::shared_ptr<Recorder> retiredRecorder;
  sk_sp<SkPicture> retiredPicture;
  {
    std::lock_guard<std::mutex> lock(_mutex);
    retiredRecorder = std::exchange(_recorder, std::move(recorder));
    retiredPicture = std::exchange(_picture, std::move(picture));
    _dirty = dirty;
    if (dirty) {
      kickLocked();
    }
  }
  // Both are released here, outside the lock.
}

bool RNSkGraphiteProducer::hasContent() {
  std::lock_guard<std::mutex> lock(_mutex);
  return _recorder != nullptr || _picture != nullptr;
}

bool RNSkGraphiteProducer::applyUpdatesTo(
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

bool RNSkGraphiteProducer::applyUpdates(jsi::Runtime &runtime,
                                        double recorderId,
                                        const jsi::Array &values) {
  std::shared_ptr<Recorder> recorder;
  {
    std::lock_guard<std::mutex> lock(_mutex);
    recorder = _recorder;
  }
  // Outside the lock: a commit replacing the recorder must not wait for the
  // read. Should it land while this runs, the values go into the retired
  // recorder and the commit's own frame draws the new one.
  if (!applyUpdatesTo(recorder, runtime, recorderId, values)) {
    return false;
  }
  std::lock_guard<std::mutex> lock(_mutex);
  _dirty = true;
  kickLocked();
  return true;
}

bool RNSkGraphiteProducer::requestFrame() {
  std::lock_guard<std::mutex> lock(_mutex);
  _dirty = true;
  kickLocked();
  return _target != nullptr && (_recorder != nullptr || _picture != nullptr);
}

void RNSkGraphiteProducer::onRecordingsPresented(
    const std::vector<std::shared_ptr<RNSkGraphiteRecording>> &recordings) {
  std::lock_guard<std::mutex> lock(_mutex);
  for (const auto &recording : recordings) {
    if (auto deferred = _schedule.recordingPresented(recording)) {
      _target->submit(std::move(*deferred));
    }
  }
  if (_dirty) {
    kickLocked();
  }
}

void RNSkGraphiteProducer::kickLocked() {
  if (_target == nullptr || (_recorder == nullptr && _picture == nullptr) ||
      !_schedule.tryStartJob()) {
    return;
  }
  std::weak_ptr<RNSkGraphiteProducer> weakThis = weak_from_this();
  RNSkThreadPool::getInstance().post([weakThis]() {
    if (auto self = weakThis.lock()) {
      self->produce();
    }
  });
}

void RNSkGraphiteProducer::produce() {
  std::shared_ptr<RNSkGraphiteTarget> target;
  std::shared_ptr<Recorder> recorder;
  sk_sp<SkPicture> picture;
  {
    std::lock_guard<std::mutex> lock(_mutex);
    target = _target;
    recorder = _recorder;
    picture = _picture;
    _dirty = false;
  }
  std::shared_ptr<RNSkGraphiteRecording> recording;
  if (target && (recorder || picture)) {
    SkCanvas *canvas = nullptr;
    try {
      canvas = target->beginRecording();
    } catch (const std::exception &) {
      // No surface and no layout yet: the view asks for a frame once it
      // has a size.
    }
    if (canvas != nullptr) {
      try {
        // The deferred canvas already draws in points.
        drawContent(canvas, recorder.get(), picture, /* pixelDensity= */ 1.0f);
      } catch (const std::exception &e) {
        RNSkLogger::logToConsole("Canvas: replaying the scene failed: %s",
                                 e.what());
      }
      try {
        recording = target->finishRecording();
      } catch (const std::exception &e) {
        RNSkLogger::logToConsole("Canvas: recording the frame failed: %s",
                                 e.what());
      }
    }
  }
  std::lock_guard<std::mutex> lock(_mutex);
  // Submitted under the lock: a frame presented in between (a redraw
  // replaying the last one) would otherwise clear the flag before the
  // recording is even queued.
  if (recording != nullptr && target == _target) {
    if (auto ready = _schedule.finishJob(std::move(recording))) {
      target->submit(std::move(*ready));
    }
    // Values that arrived during the replay start the next job as soon as
    // the pacing lets it.
    if (_dirty) {
      kickLocked();
    }
    return;
  }
  _schedule.endJob();
  if (recording != nullptr) {
    // Queued even if the view was bound to another target while this job
    // ran: a target never drops a recording, a later one on the same
    // recorder may depend on resources this one uploads. The new target has
    // none yet.
    target->submit(std::move(recording));
  }
  // Nothing was recorded for the current target: keep the content dirty so
  // that the next request (a surface, a resize) records it. A request that
  // landed while this job ran (binding a new target is one) was only noted
  // as dirty; it starts the next job now.
  const bool requested = _dirty;
  _dirty = true;
  if (requested) {
    kickLocked();
  }
}

void RNSkGraphiteProducer::renderInto(SkCanvas *canvas, float pixelDensity) {
  std::shared_ptr<Recorder> recorder;
  sk_sp<SkPicture> picture;
  {
    std::lock_guard<std::mutex> lock(_mutex);
    recorder = _recorder;
    picture = _picture;
  }
  drawContent(canvas, recorder.get(), picture, pixelDensity);
}

} // namespace RNSkia
