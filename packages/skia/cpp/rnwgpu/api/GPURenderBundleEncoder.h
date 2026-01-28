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
#include "GPURenderBundle.h"
#include "descriptors/GPURenderBundleDescriptor.h"
#include "GPURenderPipeline.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPURenderBundleEncoder : public NativeObject<GPURenderBundleEncoder> {
public:
  static constexpr const char *CLASS_NAME = "GPURenderBundleEncoder";

  explicit GPURenderBundleEncoder(wgpu::RenderBundleEncoder instance,
                                  std::string label)
      : NativeObject(CLASS_NAME), _instance(instance), _label(label) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  std::shared_ptr<GPURenderBundle>
  finish(std::optional<std::shared_ptr<GPURenderBundleDescriptor>> descriptor);
  void pushDebugGroup(std::string groupLabel);
  void popDebugGroup();
  void insertDebugMarker(std::string markerLabel);
  void setBindGroup(
      uint32_t index,
      std::variant<std::nullptr_t, std::shared_ptr<GPUBindGroup>> bindGroup,
      std::optional<std::vector<uint32_t>> dynamicOffsets);
  void setPipeline(std::shared_ptr<GPURenderPipeline> pipeline);
  void setIndexBuffer(std::shared_ptr<GPUBuffer> buffer,
                      wgpu::IndexFormat indexFormat,
                      std::optional<uint64_t> offset,
                      std::optional<uint64_t> size);
  void setVertexBuffer(
      uint32_t slot,
      std::variant<std::nullptr_t, std::shared_ptr<GPUBuffer>> buffer,
      std::optional<uint64_t> offset, std::optional<uint64_t> size);
  void draw(uint32_t vertexCount, std::optional<uint32_t> instanceCount,
            std::optional<uint32_t> firstVertex,
            std::optional<uint32_t> firstInstance);
  void drawIndexed(uint32_t indexCount, std::optional<uint32_t> instanceCount,
                   std::optional<uint32_t> firstIndex,
                   std::optional<double> baseVertex,
                   std::optional<uint32_t> firstInstance);
  void drawIndirect(std::shared_ptr<GPUBuffer> indirectBuffer,
                    uint64_t indirectOffset);
  void drawIndexedIndirect(std::shared_ptr<GPUBuffer> indirectBuffer,
                           uint64_t indirectOffset);

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand",
                  &GPURenderBundleEncoder::getBrand);
    installMethod(runtime, prototype, "finish",
                  &GPURenderBundleEncoder::finish);
    installMethod(runtime, prototype, "pushDebugGroup",
                  &GPURenderBundleEncoder::pushDebugGroup);
    installMethod(runtime, prototype, "popDebugGroup",
                  &GPURenderBundleEncoder::popDebugGroup);
    installMethod(runtime, prototype, "insertDebugMarker",
                  &GPURenderBundleEncoder::insertDebugMarker);
    installMethod(runtime, prototype, "setBindGroup",
                  &GPURenderBundleEncoder::setBindGroup);
    installMethod(runtime, prototype, "setPipeline",
                  &GPURenderBundleEncoder::setPipeline);
    installMethod(runtime, prototype, "setIndexBuffer",
                  &GPURenderBundleEncoder::setIndexBuffer);
    installMethod(runtime, prototype, "setVertexBuffer",
                  &GPURenderBundleEncoder::setVertexBuffer);
    installMethod(runtime, prototype, "draw", &GPURenderBundleEncoder::draw);
    installMethod(runtime, prototype, "drawIndexed",
                  &GPURenderBundleEncoder::drawIndexed);
    installMethod(runtime, prototype, "drawIndirect",
                  &GPURenderBundleEncoder::drawIndirect);
    installMethod(runtime, prototype, "drawIndexedIndirect",
                  &GPURenderBundleEncoder::drawIndexedIndirect);
    installGetterSetter(runtime, prototype, "label",
                        &GPURenderBundleEncoder::getLabel,
                        &GPURenderBundleEncoder::setLabel);
  }

  inline const wgpu::RenderBundleEncoder get() { return _instance; }

private:
  wgpu::RenderBundleEncoder _instance;
  std::string _label;
};

} // namespace rnwgpu
