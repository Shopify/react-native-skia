#pragma once

#include <JsiHostObject.h>

namespace RNSkia {

enum RNSkTouchType { Start, Active, End, Cancelled };

using RNSkTouchPoint = struct {
  double x;
  double y;
  double force;
  RNSkTouchType type;
};

class RNSkInfoObject : public JsiHostObject {
public:
  JSI_PROPERTY_GET(width) { return _width; }
  JSI_PROPERTY_GET(height) { return _height; }
  JSI_PROPERTY_GET(timestamp) { return _timestamp; }

  JSI_PROPERTY_GET(touches) {
    auto ops = jsi::Array(runtime, _touchesCache.size());
    for (size_t i = 0; i < _touchesCache.size(); i++) {
      auto cur = _touchesCache.at(i);
      auto touches = jsi::Array(runtime, cur.size());
      for (size_t n = 0; n < cur.size(); n++) {
        auto touchObj = jsi::Object(runtime);
        touchObj.setProperty(runtime, "x", cur.at(n).x);
        touchObj.setProperty(runtime, "y", cur.at(n).y);
        touchObj.setProperty(runtime, "force", cur.at(n).force);
        touchObj.setProperty(runtime, "type", (double)cur.at(n).type);
        touches.setValueAtIndex(runtime, n, touchObj);
      }
      ops.setValueAtIndex(runtime, i, touches);
    }
    return ops;
  }

  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(RNSkInfoObject, width),
                              JSI_EXPORT_PROP_GET(RNSkInfoObject, height),
                              JSI_EXPORT_PROP_GET(RNSkInfoObject, timestamp),
                              JSI_EXPORT_PROP_GET(RNSkInfoObject, touches))

  void update(int width, int height, double timestamp) {
    _width = width;
    _height = height;
    _timestamp = timestamp;

    // Copy touches
    std::lock_guard<std::mutex> lock(*_mutex);
    _touchesCache = _currentTouches;
    _currentTouches.clear();
  }

  void resetTouches() { _touchesCache.clear(); }

  void updateTouches(std::vector<RNSkTouchPoint> touches) {
    std::lock_guard<std::mutex> lock(*_mutex);
    _currentTouches.push_back(touches);
  }

  RNSkInfoObject() : JsiHostObject(), _mutex(std::make_shared<std::mutex>()) {}

private:
  int _width;
  int _height;
  double _timestamp;
  std::vector<std::vector<RNSkTouchPoint>> _currentTouches;
  std::vector<std::vector<RNSkTouchPoint>> _touchesCache;
  std::shared_ptr<std::mutex> _mutex;
};
} // namespace RNSkia
