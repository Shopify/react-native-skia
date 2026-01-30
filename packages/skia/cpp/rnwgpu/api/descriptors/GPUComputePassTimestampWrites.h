#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "rnwgpu/api/GPUQuerySet.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUComputePassTimestampWrites {
  std::shared_ptr<GPUQuerySet> querySet;           // GPUQuerySet
  std::optional<double> beginningOfPassWriteIndex; // GPUSize32
  std::optional<double> endOfPassWriteIndex;       // GPUSize32
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUComputePassTimestampWrites>> {
  static std::shared_ptr<rnwgpu::GPUComputePassTimestampWrites>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUComputePassTimestampWrites>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "querySet")) {
        auto prop = value.getProperty(runtime, "querySet");
        result->querySet = JSIConverter<std::shared_ptr<GPUQuerySet>>::fromJSI(
            runtime, prop, false);
      }
      if (value.hasProperty(runtime, "beginningOfPassWriteIndex")) {
        auto prop = value.getProperty(runtime, "beginningOfPassWriteIndex");
        result->beginningOfPassWriteIndex =
            JSIConverter<std::optional<double>>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "endOfPassWriteIndex")) {
        auto prop = value.getProperty(runtime, "endOfPassWriteIndex");
        result->endOfPassWriteIndex =
            JSIConverter<std::optional<double>>::fromJSI(runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value
  toJSI(jsi::Runtime &runtime,
        std::shared_ptr<rnwgpu::GPUComputePassTimestampWrites> arg) {
    throw std::runtime_error("Invalid GPUComputePassTimestampWrites::toJSI()");
  }
};

} // namespace rnwgpu