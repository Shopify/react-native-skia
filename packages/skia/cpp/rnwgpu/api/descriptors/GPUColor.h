#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUColor {
  double r; // number
  double g; // number
  double b; // number
  double a; // number
};

} // namespace rnwgpu

namespace rnwgpu {

template <> struct JSIConverter<std::shared_ptr<rnwgpu::GPUColor>> {
  static std::shared_ptr<rnwgpu::GPUColor>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUColor>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.isArray(runtime)) {
        auto array = value.getArray(runtime);
        if (array.size(runtime) >= 4) {
          result->r = array.getValueAtIndex(runtime, 0).getNumber();
          result->g = array.getValueAtIndex(runtime, 1).getNumber();
          result->b = array.getValueAtIndex(runtime, 2).getNumber();
          result->a = array.getValueAtIndex(runtime, 3).getNumber();
        }
      } else {
        if (value.hasProperty(runtime, "r")) {
          auto prop = value.getProperty(runtime, "r");
          result->r = JSIConverter<double>::fromJSI(runtime, prop, false);
        }
        if (value.hasProperty(runtime, "g")) {
          auto prop = value.getProperty(runtime, "g");
          result->g = JSIConverter<double>::fromJSI(runtime, prop, false);
        }
        if (value.hasProperty(runtime, "b")) {
          auto prop = value.getProperty(runtime, "b");
          result->b = JSIConverter<double>::fromJSI(runtime, prop, false);
        }
        if (value.hasProperty(runtime, "a")) {
          auto prop = value.getProperty(runtime, "a");
          result->a = JSIConverter<double>::fromJSI(runtime, prop, false);
        }
      }
    }

    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUColor> arg) {
    throw std::runtime_error("Invalid GPUColor::toJSI()");
  }
};

} // namespace rnwgpu
