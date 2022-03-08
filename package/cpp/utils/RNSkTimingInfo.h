#pragma once

#define NUMBER_OF_DURATION_SAMPLES 10

namespace RNSkia {
class RNSkTimingInfo {
public:
  RNSkTimingInfo() {
    _lastDurationIndex = 0;
    _lastDurationsCount = 0;
    _lastDuration = 0;
  }

  ~RNSkTimingInfo() {}

  void reset() {
    _lastDurationIndex = 0;
    _lastDurationsCount = 0;
    _lastDuration = 0;
  }
  
  void beginTiming() {
    _start = std::chrono::high_resolution_clock::now();
  }
  
  void stopTiming() {
    auto stop = std::chrono::high_resolution_clock::now();
    addLastDuration(std::chrono::duration_cast<std::chrono::milliseconds>(stop - _start).count());
  }

  long getAverage() { return static_cast<long>(_average); }

  void addLastDuration(long duration) {
    _lastDuration = duration;

    // Average duration
    _lastDurations[_lastDurationIndex++] = _lastDuration;

    if (_lastDurationIndex == NUMBER_OF_DURATION_SAMPLES) {
      _lastDurationIndex = 0;
    }

    if (_lastDurationsCount < NUMBER_OF_DURATION_SAMPLES) {
      _lastDurationsCount++;
    }

    _average = 0;
    for (size_t i = 0; i < _lastDurationsCount; i++) {
      _average = _average + _lastDurations[i];
    }
    _average = _average / _lastDurationsCount;
  }

private:
  double _lastTimeStamp;
  long _lastDurations[NUMBER_OF_DURATION_SAMPLES];
  int _lastDurationIndex;
  int _lastDurationsCount;
  long _lastDuration;
  std::atomic<double> _average;
  std::chrono::time_point<steady_clock> _start;
};
} // namespace RNSkia
