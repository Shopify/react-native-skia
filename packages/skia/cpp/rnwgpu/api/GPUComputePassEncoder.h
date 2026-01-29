#pragma once

#include <memory>
#include <optional>
#include <string>
#include <variant>
#include <vector>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

#include "GPUBindGroup.h"
#include "GPUBuffer.h"
#include "GPUComputePipeline.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUComputePassEncoder : public NativeObject<GPUComputePassEncoder> {
public:
  static constexpr const char *CLASS_NAME = "GPUComputePassEncoder";

  explicit GPUComputePassEncoder(wgpu::ComputePassEncoder instance,
                                 std::string label)
      : NativeObject(CLASS_NAME), _instance(instance), _label(label) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  void setPipeline(std::shared_ptr<GPUComputePipeline> pipeline);
  void dispatchWorkgroups(uint32_t workgroupCountX,
                          std::optional<uint32_t> workgroupCountY,
                          std::optional<uint32_t> workgroupCountZ);
  void dispatchWorkgroupsIndirect(std::shared_ptr<GPUBuffer> indirectBuffer,
                                  uint64_t indirectOffset);
  void end();
  void pushDebugGroup(std::string groupLabel);
  void popDebugGroup();
  void insertDebugMarker(std::string markerLabel);
  void setBindGroup(
      uint32_t index,
      std::variant<std::nullptr_t, std::shared_ptr<GPUBindGroup>> bindGroup,
      std::optional<std::vector<uint32_t>> dynamicOffsets);

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand",
                  &GPUComputePassEncoder::getBrand);
    installMethod(runtime, prototype, "setPipeline",
                  &GPUComputePassEncoder::setPipeline);
    installMethod(runtime, prototype, "dispatchWorkgroups",
                  &GPUComputePassEncoder::dispatchWorkgroups);
    installMethod(runtime, prototype, "dispatchWorkgroupsIndirect",
                  &GPUComputePassEncoder::dispatchWorkgroupsIndirect);
    installMethod(runtime, prototype, "end", &GPUComputePassEncoder::end);
    installMethod(runtime, prototype, "pushDebugGroup",
                  &GPUComputePassEncoder::pushDebugGroup);
    installMethod(runtime, prototype, "popDebugGroup",
                  &GPUComputePassEncoder::popDebugGroup);
    installMethod(runtime, prototype, "insertDebugMarker",
                  &GPUComputePassEncoder::insertDebugMarker);
    installMethod(runtime, prototype, "setBindGroup",
                  &GPUComputePassEncoder::setBindGroup);
    installGetterSetter(runtime, prototype, "label",
                        &GPUComputePassEncoder::getLabel,
                        &GPUComputePassEncoder::setLabel);
  }

  inline const wgpu::ComputePassEncoder get() { return _instance; }

private:
  wgpu::ComputePassEncoder _instance;
  std::string _label;
};

} // namespace rnwgpu
