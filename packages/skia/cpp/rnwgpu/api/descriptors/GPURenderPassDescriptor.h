#pragma once

#include <memory>
#include <string>
#include <variant>
#include <vector>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "rnwgpu/api/GPUQuerySet.h"
#include "GPURenderPassColorAttachment.h"
#include "GPURenderPassDepthStencilAttachment.h"
#include "GPURenderPassTimestampWrites.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPURenderPassDescriptor {
  std::vector<std::variant<std::nullptr_t,
                           std::shared_ptr<GPURenderPassColorAttachment>>>
      colorAttachments; // Iterable<GPURenderPassColorAttachment | null>
  std::optional<std::shared_ptr<GPURenderPassDepthStencilAttachment>>
      depthStencilAttachment; // GPURenderPassDepthStencilAttachment
  std::optional<std::shared_ptr<GPUQuerySet>> occlusionQuerySet; // GPUQuerySet
  std::optional<std::shared_ptr<GPURenderPassTimestampWrites>>
      timestampWrites;                // GPURenderPassTimestampWrites
  std::optional<double> maxDrawCount; // GPUSize64
  std::optional<std::string> label;   // string
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPURenderPassDescriptor>> {
  static std::shared_ptr<rnwgpu::GPURenderPassDescriptor>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPURenderPassDescriptor>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "colorAttachments")) {
        auto prop = value.getProperty(runtime, "colorAttachments");
        result->colorAttachments = JSIConverter<std::vector<std::variant<
            std::nullptr_t, std::shared_ptr<GPURenderPassColorAttachment>>>>::
            fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "depthStencilAttachment")) {
        auto prop = value.getProperty(runtime, "depthStencilAttachment");
        result->depthStencilAttachment =
            JSIConverter<std::optional<std::shared_ptr<
                GPURenderPassDepthStencilAttachment>>>::fromJSI(runtime, prop,
                                                                false);
      }
      if (value.hasProperty(runtime, "occlusionQuerySet")) {
        auto prop = value.getProperty(runtime, "occlusionQuerySet");
        result->occlusionQuerySet =
            JSIConverter<std::optional<std::shared_ptr<GPUQuerySet>>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "timestampWrites")) {
        auto prop = value.getProperty(runtime, "timestampWrites");
        result->timestampWrites = JSIConverter<std::optional<
            std::shared_ptr<GPURenderPassTimestampWrites>>>::fromJSI(runtime,
                                                                     prop,
                                                                     false);
      }
      if (value.hasProperty(runtime, "maxDrawCount")) {
        auto prop = value.getProperty(runtime, "maxDrawCount");
        result->maxDrawCount =
            JSIConverter<std::optional<double>>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "label")) {
        auto prop = value.getProperty(runtime, "label");
        result->label = JSIConverter<std::optional<std::string>>::fromJSI(
            runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value
  toJSI(jsi::Runtime &runtime,
        std::shared_ptr<rnwgpu::GPURenderPassDescriptor> arg) {
    throw std::runtime_error("Invalid GPURenderPassDescriptor::toJSI()");
  }
};

} // namespace rnwgpu