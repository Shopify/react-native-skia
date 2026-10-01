// The recorder headers depend on the include order established by
// JsiSkApi.h, so everything that needs a complete Recorder lives here rather
// than in RNSkGraphiteProducer.h (which the view headers include on their own).
#if defined(SK_GRAPHITE)

#include "api/JsiSkApi.h"

#include "RNSkGraphiteProducer.h"

#include "RNSkGraphiteView.h"
#include "RNSkThreadPool.h"
#include "api/recorder/DrawingCtx.h"
#include "api/recorder/RNRecorder.h"
#include "utils/RNSkLog.h"

#include "include/core/SkCanvas.h"
#include "include/core/SkPicture.h"

namespace RNSkia {

RNSkGraphiteProducer::RNSkGraphiteProducer(
    std::shared_ptr<RNSkPlatformContext> context)
    : _context(std::move(context)) {}

RNSkGraphiteProducer::~RNSkGraphiteProducer() = default;

void RNSkGraphiteProducer::setTarget(
    std::shared_ptr<RNSkGraphiteTarget> target) {
  std::lock_guard<std::mutex> lock(_mutex);
  _target = std::move(target);
  _dirty = true;
  kickLocked();
}

void RNSkGraphiteProducer::setRecorder(std::shared_ptr<Recorder> recorder) {
  std::shared_ptr<Recorder> retired;
  {
    std::lock_guard<std::mutex> lock(_mutex);
    retired = std::move(_recorder);
    _recorder = std::move(recorder);
    _picture = nullptr;
    // Writes read for the previous recorder point into its commands.
    _pendingWrites.clear();
    _dirty = true;
    kickLocked();
  }
  // Released outside the lock: the destructor hands the commands to the main
  // thread. A pool thread still replaying it keeps it alive until it is done.
  retired = nullptr;
}

void RNSkGraphiteProducer::setPicture(sk_sp<SkPicture> picture) {
  std::shared_ptr<Recorder> retired;
  {
    std::lock_guard<std::mutex> lock(_mutex);
    retired = std::move(_recorder);
    _picture = std::move(picture);
    _pendingWrites.clear();
    _dirty = true;
    kickLocked();
  }
  retired = nullptr;
}

void RNSkGraphiteProducer::clear() {
  std::shared_ptr<Recorder> retired;
  sk_sp<SkPicture> picture;
  {
    std::lock_guard<std::mutex> lock(_mutex);
    retired = std::move(_recorder);
    picture = std::move(_picture);
    _pendingWrites.clear();
    _dirty = false;
  }
  // Both are destroyed here, outside the lock.
}

bool RNSkGraphiteProducer::hasContent() {
  std::lock_guard<std::mutex> lock(_mutex);
  return _recorder != nullptr || _picture != nullptr;
}

bool RNSkGraphiteProducer::applyUpdates(jsi::Runtime &runtime,
                                        double recorderId,
                                        const jsi::Array &values) {
  std::lock_guard<std::mutex> lock(_mutex);
  if (_recorder == nullptr || _recorder->id != recorderId) {
    return false;
  }
  _recorder->readUpdates(runtime, values, [this](PendingWrite write) {
    _pendingWrites.push_back(std::move(write));
  });
  _dirty = true;
  kickLocked();
  return true;
}

void RNSkGraphiteProducer::requestFrame() {
  std::lock_guard<std::mutex> lock(_mutex);
  _dirty = true;
  kickLocked();
}

void RNSkGraphiteProducer::onFramePresented() {
  std::lock_guard<std::mutex> lock(_mutex);
  _presentPending = false;
  if (_dirty) {
    kickLocked();
  }
}

void RNSkGraphiteProducer::kickLocked() {
  if (_inFlight || _presentPending || _target == nullptr ||
      (_recorder == nullptr && _picture == nullptr)) {
    return;
  }
  _inFlight = true;
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
  std::vector<std::function<void()>> writes;
  {
    std::lock_guard<std::mutex> lock(_mutex);
    target = _target;
    recorder = _recorder;
    picture = _picture;
    writes = std::move(_pendingWrites);
    _pendingWrites.clear();
    _dirty = false;
  }
  std::shared_ptr<RNSkGraphiteRecording> recording;
  bool recorded = false;
  // The writes are applied whether or not a frame can be recorded: the
  // commands must hold the latest values for the next frame or snapshot.
  if (recorder && !writes.empty()) {
    recorder->applyWrites(writes);
  }
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
        canvas->clear(SK_ColorTRANSPARENT);
        draw(canvas, recorder.get(), picture);
      } catch (const std::exception &e) {
        RNSkLogger::logToConsole("Canvas2: replaying the scene failed: %s",
                                 e.what());
      }
      try {
        recording = target->finishRecording();
        recorded = recording != nullptr;
      } catch (const std::exception &e) {
        RNSkLogger::logToConsole("Canvas2: recording the frame failed: %s",
                                 e.what());
      }
    }
  }
  {
    std::lock_guard<std::mutex> lock(_mutex);
    _inFlight = false;
    if (recorded) {
      // The next job starts when this frame is on screen.
      _presentPending = true;
    } else {
      // Nothing was recorded: keep the content dirty so that the next
      // request (a surface, a resize) records it.
      _dirty = true;
    }
  }
  if (recorded) {
    target->submit(std::move(recording));
  }
}

void RNSkGraphiteProducer::renderInto(SkCanvas *canvas, float pixelDensity) {
  std::shared_ptr<Recorder> recorder;
  sk_sp<SkPicture> picture;
  std::vector<std::function<void()>> writes;
  {
    std::lock_guard<std::mutex> lock(_mutex);
    recorder = _recorder;
    picture = _picture;
    writes = std::move(_pendingWrites);
    _pendingWrites.clear();
  }
  if (recorder && !writes.empty()) {
    recorder->applyWrites(writes);
  }
  canvas->clear(SK_ColorTRANSPARENT);
  canvas->save();
  canvas->scale(pixelDensity, pixelDensity);
  draw(canvas, recorder.get(), picture);
  canvas->restore();
}

void RNSkGraphiteProducer::draw(SkCanvas *canvas, Recorder *recorder,
                                const sk_sp<SkPicture> &picture) {
  if (recorder != nullptr) {
    DrawingCtx ctx(canvas);
    recorder->play(&ctx);
  } else if (picture != nullptr) {
    canvas->drawPicture(picture);
  }
}

} // namespace RNSkia

#endif // SK_GRAPHITE
