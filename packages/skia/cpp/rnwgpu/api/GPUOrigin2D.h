#pragma once

#include <memory>

#include "jsi2/JSIConverter.h"

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

struct GPUOrigin2D {
  double x = 0;
  double y = 0;
};

template <> struct JSIConverter<std::shared_ptr<GPUOrigin2D>> {
  static std::shared_ptr<GPUOrigin2D>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<GPUOrigin2D>();
    if (!outOfBounds && arg.isObject()) {
      if (arg.getObject(runtime).isArray(runtime)) {
        auto array = arg.getObject(runtime).asArray(runtime);
        auto size = array.size(runtime);
        if (size == 0) {
          throw std::runtime_error(
              "Expected an array of size >1 for GPUTExtent2D");
        }
        if (size > 0) {
          result->x = array.getValueAtIndex(runtime, 0).asNumber();
        }
        if (size > 1) {
          result->y = array.getValueAtIndex(runtime, 1).asNumber();
        }
      } else {
        auto object = arg.getObject(runtime);
        if (object.hasProperty(runtime, "x")) {
          result->x = object.getProperty(runtime, "x").asNumber();
        }
        if (object.hasProperty(runtime, "y")) {
          result->y = object.getProperty(runtime, "y").asNumber();
        }
      }
    } else {
      throw std::runtime_error("Expected an object for GPUOrigin3D");
    }
    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<GPUOrigin2D> arg) {
    // No conversions here
    return jsi::Value::null();
  }
};

} // namespace rnwgpu
