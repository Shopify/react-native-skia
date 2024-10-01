#pragma once

#include <chrono>
#include <memory>
#include <mutex>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiHostObject.h"
#include "RNSkView.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

class RNSkInfoObject : public RNJsi::JsiHostObject {
public:
  JSI_PROPERTY_GET(width) { return _width; }
  JSI_PROPERTY_GET(height) { return _height; }
  JSI_PROPERTY_GET(timestamp) { return _timestamp; }

  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(RNSkInfoObject, width),
                              JSI_EXPORT_PROP_GET(RNSkInfoObject, height),
                              JSI_EXPORT_PROP_GET(RNSkInfoObject, timestamp))

  void beginDrawOperation(int width, int height, double timestamp) {
    _width = width;
    _height = height;
    _timestamp = timestamp;
  }

  void endDrawOperation() { }


  RNSkInfoObject() : JsiHostObject() {}

private:
  int _width;
  int _height;
  double _timestamp;
};
} // namespace RNSkia
