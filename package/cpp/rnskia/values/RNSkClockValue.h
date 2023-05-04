#pragma once

#include "RNSkPlatformContext.h"

#include <jsi/jsi.h>

#include <algorithm>
#include <chrono>
#include <memory>
#include <utility>

#include "RNSkValue.h"

namespace RNSkia {

static size_t ClockIdentifier = 50000;

/**
 Implements a base clock value class
 */
class RNSkClockValue : public RNSkValue {
public:
  /**
   Constructor
   */
  explicit RNSkClockValue(std::shared_ptr<RNSkPlatformContext> platformContext)
      : RNSkValue(platformContext), _identifier(ClockIdentifier++) {}

  /**
   Destructor
   */
  ~RNSkClockValue() { stopClock(); }

  /**
   Starts the clock
   */
  void startClock() {
    if (_isRunning) {
      return;
    }

    _isRunning = true;
    _identifier = getContext()->beginDrawLoop(
        _identifier, [weakSelf = weak_from_this()](bool invalidated) {
          auto self = weakSelf.lock();
          if (self) {
            std::static_pointer_cast<RNSkClockValue>(self)->drawLoopCallback(
                invalidated);
          }
        });

    _startTime = std::chrono::high_resolution_clock::now();
    onClockStarted();
  }

  /**
   Stops the clock
   */
  void stopClock() {
    if (!_isRunning) {
      return;
    }
    getContext()->endDrawLoop(_identifier);
    _isRunning = false;
    onClockStopped();
  }

  JSI_HOST_FUNCTION(cancel) {
    stopClock();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(stop) {
    stopClock();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(start) {
    startClock();
    return jsi::Value::undefined();
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(RNSkClockValue, cancel),
                       JSI_EXPORT_FUNC(RNSkClockValue, stop),
                       JSI_EXPORT_FUNC(RNSkClockValue, start),
                       JSI_EXPORT_FUNC(RNSkValue, __invalidate),
                       JSI_EXPORT_FUNC(RNSkValue, addListener))

protected:
  /**
   Callback when clock source triggers.
   */
  virtual void onClockUpdated(double ellapsedTimeMs) {
    setCurrent(ellapsedTimeMs);
  }

  virtual void onClockStarted() {}
  virtual void onClockStopped() {}

  /*
   Handles callback when listeners are empty. Then we'll just stop the
   clock
   */
  void onListenersEmpty() override { stopClock(); }

private:
  /*
   Callback from the draw loop. The invalidated parameter is true if the
   platform context triggering the clock has been invalidated.
   */
  void drawLoopCallback(bool invalidated) {
    auto now = std::chrono::high_resolution_clock::now();
    onClockUpdated(
        std::chrono::duration_cast<std::chrono::milliseconds>(now - _startTime)
            .count());
  }

  // Identifier for the clock. Used to track draw loop for
  // registration/unregistration
  size_t _identifier;

  // Flag for current clock state.
  bool _isRunning;

  // Start time. Will be reset first time we start.
  std::chrono::time_point<std::chrono::steady_clock> _startTime;
};
} // namespace RNSkia
