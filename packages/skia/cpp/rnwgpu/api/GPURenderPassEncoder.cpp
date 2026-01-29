#include <memory>
#include <string>
#include <vector>

#include "Convertors.h"
#include "GPURenderPassEncoder.h"

namespace rnwgpu {

void GPURenderPassEncoder::end() { _instance.End(); }

void GPURenderPassEncoder::setPipeline(
    std::shared_ptr<GPURenderPipeline> pipeline) {
  _instance.SetPipeline(pipeline->get());
}

void GPURenderPassEncoder::draw(uint32_t vertexCount,
                                std::optional<uint32_t> instanceCount,
                                std::optional<uint32_t> firstVertex,
                                std::optional<uint32_t> firstInstance) {
  _instance.Draw(vertexCount, instanceCount.value_or(1),
                 firstVertex.value_or(0), firstInstance.value_or(0));
}
void GPURenderPassEncoder::setVertexBuffer(
    uint32_t slot,
    std::variant<std::nullptr_t, std::shared_ptr<GPUBuffer>> buffer,
    std::optional<uint64_t> offset, std::optional<uint64_t> size) {
  Convertor conv;

  wgpu::Buffer b{};
  uint64_t s = wgpu::kWholeSize;
  if (!conv(b, buffer) || !conv(s, size)) {
    return;
  }
  _instance.SetVertexBuffer(slot, b, offset.value_or(0), s);
}

void GPURenderPassEncoder::setBindGroup(
    uint32_t groupIndex,
    std::variant<std::nullptr_t, std::shared_ptr<GPUBindGroup>> bindGroup,
    std::optional<std::vector<uint32_t>> dynamicOffsets) {
  auto dynOffsets = dynamicOffsets.value_or(std::vector<uint32_t>());
  if (dynOffsets.size() == 0) {
    if (std::holds_alternative<nullptr_t>(bindGroup)) {
      _instance.SetBindGroup(groupIndex, nullptr, 0, nullptr);
    } else {
      auto group = std::get<std::shared_ptr<GPUBindGroup>>(bindGroup);
      _instance.SetBindGroup(groupIndex, group->get(), 0, nullptr);
    }
  } else {
    if (std::holds_alternative<nullptr_t>(bindGroup)) {
      _instance.SetBindGroup(groupIndex, nullptr, dynOffsets.size(),
                             dynamicOffsets->data());
    } else {
      auto group = std::get<std::shared_ptr<GPUBindGroup>>(bindGroup);
      _instance.SetBindGroup(groupIndex, group->get(), dynOffsets.size(),
                             dynamicOffsets->data());
    }
  }
}

void GPURenderPassEncoder::setIndexBuffer(std::shared_ptr<GPUBuffer> buffer,
                                          wgpu::IndexFormat indexFormat,
                                          std::optional<uint64_t> offset,
                                          std::optional<uint64_t> size) {
  Convertor conv;

  wgpu::Buffer b{};
  wgpu::IndexFormat f{};
  uint64_t o = 0;
  uint64_t s = wgpu::kWholeSize;
  if (!conv(b, buffer) ||      //
      !conv(f, indexFormat) || //
      !conv(o, offset) ||      //
      !conv(s, size)) {
    return;
  }

  _instance.SetIndexBuffer(b, f, o, s);
}

void GPURenderPassEncoder::endOcclusionQuery() {
  _instance.EndOcclusionQuery();
}

void GPURenderPassEncoder::beginOcclusionQuery(uint32_t queryIndex) {
  _instance.BeginOcclusionQuery(queryIndex);
}

void GPURenderPassEncoder::drawIndexed(uint32_t indexCount,
                                       std::optional<uint32_t> instanceCount,
                                       std::optional<uint32_t> firstIndex,
                                       std::optional<double> baseVertex,
                                       std::optional<uint32_t> firstInstance) {
  _instance.DrawIndexed(indexCount, instanceCount.value_or(1),
                        firstIndex.value_or(0), baseVertex.value_or(0),
                        firstInstance.value_or(0));
}

void GPURenderPassEncoder::executeBundles(
    std::vector<std::shared_ptr<GPURenderBundle>> bundles_in) {
  Convertor conv;

  wgpu::RenderBundle *bundles = nullptr;
  size_t bundleCount = 0;
  if (!conv(bundles, bundleCount, bundles_in)) {
    return;
  }

  _instance.ExecuteBundles(bundleCount, bundles);
}

void GPURenderPassEncoder::setScissorRect(uint32_t x, uint32_t y,
                                          uint32_t width, uint32_t height) {
  _instance.SetScissorRect(x, y, width, height);
}

void GPURenderPassEncoder::setViewport(double x, double y, double width,
                                       double height, double minDepth,
                                       double maxDepth) {
  _instance.SetViewport(x, y, width, height, minDepth, maxDepth);
}

void GPURenderPassEncoder::setBlendConstant(std::shared_ptr<GPUColor> color) {
  Convertor conv;
  wgpu::Color c{};
  if (!conv(c, color)) {
    return;
  }
  _instance.SetBlendConstant(&c);
}

void GPURenderPassEncoder::setStencilReference(uint32_t reference) {
  _instance.SetStencilReference(reference);
}

void GPURenderPassEncoder::pushDebugGroup(std::string groupLabel) {
  _instance.PushDebugGroup(groupLabel.c_str());
}

void GPURenderPassEncoder::popDebugGroup() { _instance.PopDebugGroup(); }

void GPURenderPassEncoder::insertDebugMarker(std::string markerLabel) {
  _instance.InsertDebugMarker(markerLabel.c_str());
}
void GPURenderPassEncoder::drawIndirect(
    std::shared_ptr<GPUBuffer> indirectBuffer, uint64_t indirectOffset) {
  Convertor conv;
  wgpu::Buffer b{};
  if (!conv(b, indirectBuffer)) {
    return;
  }
  _instance.DrawIndirect(b, indirectOffset);
}
void GPURenderPassEncoder::drawIndexedIndirect(
    std::shared_ptr<GPUBuffer> indirectBuffer, uint64_t indirectOffset) {
  Convertor conv;
  wgpu::Buffer b{};
  if (!conv(b, indirectBuffer)) {
    return;
  }
  _instance.DrawIndexedIndirect(b, indirectOffset);
}

} // namespace rnwgpu
