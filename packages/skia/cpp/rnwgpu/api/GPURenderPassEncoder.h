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
#include "GPURenderPipeline.h"
#include "descriptors/GPUColor.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPURenderPassEncoder : public NativeObject<GPURenderPassEncoder> {
public:
  static constexpr const char *CLASS_NAME = "GPURenderPassEncoder";

  explicit GPURenderPassEncoder(wgpu::RenderPassEncoder instance,
                                std::string label)
      : NativeObject(CLASS_NAME), _instance(instance), _label(label) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  void setViewport(double x, double y, double width, double height,
                   double minDepth, double maxDepth);
  void setScissorRect(uint32_t x, uint32_t y, uint32_t width, uint32_t height);
  void setBlendConstant(std::shared_ptr<GPUColor> color);
  void setStencilReference(uint32_t reference);
  void beginOcclusionQuery(uint32_t queryIndex);
  void endOcclusionQuery();
  void executeBundles(std::vector<std::shared_ptr<GPURenderBundle>> bundles);
  void end();
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
                  &GPURenderPassEncoder::getBrand);
    installMethod(runtime, prototype, "setViewport",
                  &GPURenderPassEncoder::setViewport);
    installMethod(runtime, prototype, "setScissorRect",
                  &GPURenderPassEncoder::setScissorRect);
    installMethod(runtime, prototype, "setBlendConstant",
                  &GPURenderPassEncoder::setBlendConstant);
    installMethod(runtime, prototype, "setStencilReference",
                  &GPURenderPassEncoder::setStencilReference);
    installMethod(runtime, prototype, "beginOcclusionQuery",
                  &GPURenderPassEncoder::beginOcclusionQuery);
    installMethod(runtime, prototype, "endOcclusionQuery",
                  &GPURenderPassEncoder::endOcclusionQuery);
    installMethod(runtime, prototype, "executeBundles",
                  &GPURenderPassEncoder::executeBundles);
    installMethod(runtime, prototype, "end", &GPURenderPassEncoder::end);
    installMethod(runtime, prototype, "pushDebugGroup",
                  &GPURenderPassEncoder::pushDebugGroup);
    installMethod(runtime, prototype, "popDebugGroup",
                  &GPURenderPassEncoder::popDebugGroup);
    installMethod(runtime, prototype, "insertDebugMarker",
                  &GPURenderPassEncoder::insertDebugMarker);
    installMethod(runtime, prototype, "setBindGroup",
                  &GPURenderPassEncoder::setBindGroup);
    installMethod(runtime, prototype, "setPipeline",
                  &GPURenderPassEncoder::setPipeline);
    installMethod(runtime, prototype, "setIndexBuffer",
                  &GPURenderPassEncoder::setIndexBuffer);
    installMethod(runtime, prototype, "setVertexBuffer",
                  &GPURenderPassEncoder::setVertexBuffer);
    installMethod(runtime, prototype, "draw", &GPURenderPassEncoder::draw);
    installMethod(runtime, prototype, "drawIndexed",
                  &GPURenderPassEncoder::drawIndexed);
    installMethod(runtime, prototype, "drawIndirect",
                  &GPURenderPassEncoder::drawIndirect);
    installMethod(runtime, prototype, "drawIndexedIndirect",
                  &GPURenderPassEncoder::drawIndexedIndirect);
    installGetterSetter(runtime, prototype, "label",
                        &GPURenderPassEncoder::getLabel,
                        &GPURenderPassEncoder::setLabel);
  }

  inline const wgpu::RenderPassEncoder get() { return _instance; }

private:
  wgpu::RenderPassEncoder _instance;
  std::string _label;
};

} // namespace rnwgpu
