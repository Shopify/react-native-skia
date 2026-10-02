#pragma once

#if defined(SK_GRAPHITE)

#include <functional>
#include <memory>
#include <mutex>
#include <vector>

#include <jsi/jsi.h>

#include "RNSkPlatformContext.h"

#include "include/core/SkRefCnt.h"

class SkCanvas;
class SkPicture;

namespace RNSkia {

namespace jsi = facebook::jsi;

class Recorder;
class RNSkGraphiteTarget;

/**
 * Records the declarative content of a SkiaGraphiteView (a Recorder handed
 * over by <GraphiteCanvas>, or a picture) into Graphite recordings, on the
 * render thread pool.
 *
 * Three threads meet here. The JS thread hands over the content. A Reanimated
 * mapper, on the UI runtime, reads the shared values into pending writes: that
 * is the only step that needs a JS runtime, and it never waits for a replay.
 * A pool thread applies the writes and replays the commands (the recorder
 * serializes the two against each other) into a deferred canvas of the
 * view's target and submits the recording; the main thread presents it on
 * the next vsync.
 *
 * Pacing: a view has at most one job in flight and at most one recording
 * waiting to be presented. Updates that arrive meanwhile only mark the content
 * dirty; the next presented frame starts the next job. A producer that
 * outruns the display therefore records once per vsync, and the queue of the
 * target never grows.
 */
class RNSkGraphiteProducer
    : public std::enable_shared_from_this<RNSkGraphiteProducer> {
public:
  explicit RNSkGraphiteProducer(std::shared_ptr<RNSkPlatformContext> context);
  ~RNSkGraphiteProducer();

  /** The target to record into. Main thread. */
  void setTarget(std::shared_ptr<RNSkGraphiteTarget> target);

  /** Takes ownership of the recorder (or releases it with nullptr). */
  void setRecorder(std::shared_ptr<Recorder> recorder);

  /** Content from the static container: a picture to replay. */
  void setPicture(sk_sp<SkPicture> picture);

  bool hasContent();

  /**
   Drops the content and the pending writes without scheduling a frame:
   the host view is being torn down.
   */
  void clear();

  /**
   Reads the shared values on the calling runtime into pending writes and
   schedules a frame. Returns false when there is no recorder to update, or
   another recording than recorderId (a stale mapper).
   */
  bool applyUpdates(jsi::Runtime &runtime, double recorderId,
                    const jsi::Array &values);

  /** Marks the content dirty and schedules a frame if one can start. */
  void requestFrame();

  /** The view presented a frame: the next one may start. */
  void onFramePresented();

  /**
   Replays the current content into a canvas, on the calling thread (a
   snapshot). The canvas draws in pixels, this applies the density.
   */
  void renderInto(SkCanvas *canvas, float pixelDensity);

private:
  void kickLocked();
  void produce();
  void draw(SkCanvas *canvas, Recorder *recorder,
            const sk_sp<SkPicture> &picture);

  std::shared_ptr<RNSkPlatformContext> _context;

  // Content, pending writes and scheduling state.
  std::mutex _mutex;
  std::shared_ptr<RNSkGraphiteTarget> _target;
  std::shared_ptr<Recorder> _recorder;
  sk_sp<SkPicture> _picture;
  std::vector<std::function<void()>> _pendingWrites;
  bool _dirty = false;
  bool _inFlight = false;
  bool _presentPending = false;
};

} // namespace RNSkia

#endif // SK_GRAPHITE
