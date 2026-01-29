#pragma once

#include <memory>

#include "jsi2/JSIConverter.h"

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

struct GPUExtent3D {
  double width;
  double height = 1;
  double depthOrArrayLayers = 1;
};

template <> struct JSIConverter<std::shared_ptr<GPUExtent3D>> {
  static std::shared_ptr<GPUExtent3D>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<GPUExtent3D>();
    if (!outOfBounds && arg.isObject()) {
      if (arg.getObject(runtime).isArray(runtime)) {
        auto array = arg.getObject(runtime).asArray(runtime);
        auto size = array.size(runtime);
        if (size == 0) {
          throw std::runtime_error(
              "Expected an array of size >1 for GPUTExtent3D");
        }
        if (size > 0) {
          result->width = array.getValueAtIndex(runtime, 0).asNumber();
        }
        if (size > 1) {
          result->height = array.getValueAtIndex(runtime, 1).asNumber();
        }
        if (size > 2) {
          result->depthOrArrayLayers =
              array.getValueAtIndex(runtime, 2).asNumber();
        }
      } else {
        auto object = arg.getObject(runtime);
        if (object.hasProperty(runtime, "width")) {
          result->width = object.getProperty(runtime, "width").asNumber();
        } else {
          throw std::runtime_error("Property GPUTExtent3D::width is required");
        }
        if (object.hasProperty(runtime, "height")) {
          result->height = object.getProperty(runtime, "height").asNumber();
        }
        if (object.hasProperty(runtime, "depthOrArrayLayers")) {
          result->depthOrArrayLayers =
              object.getProperty(runtime, "depthOrArrayLayers").asNumber();
        }
      }
    } else {
      throw std::runtime_error("Expected an object for GPUTExtent3D");
    }
    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<GPUExtent3D> arg) {
    // No conversions here
    return jsi::Value::null();
  }
};

} // namespace rnwgpu
