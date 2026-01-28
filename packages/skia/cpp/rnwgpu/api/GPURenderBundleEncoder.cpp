#include "GPURenderBundleEncoder.h"

#include <memory>
#include <string>

#include "Convertors.h"

namespace rnwgpu {

std::shared_ptr<GPURenderBundle> GPURenderBundleEncoder::finish(
    std::optional<std::shared_ptr<GPURenderBundleDescriptor>> descriptor) {
  wgpu::RenderBundleDescriptor desc;
  Convertor conv;
  if (!conv(desc, descriptor)) {
    throw std::runtime_error("GPURenderBundleEncoder.finish(): couldn't get "
                             "GPURenderBundleDescriptor");
  }
  auto bundle = _instance.Finish(&desc);
  return std::make_shared<GPURenderBundle>(
      bundle,
      descriptor.has_value() ? descriptor.value()->label.value_or("") : "");
}

void GPURenderBundleEncoder::setPipeline(
    std::shared_ptr<GPURenderPipeline> pipeline) {
  _instance.SetPipeline(pipeline->get());
}

void GPURenderBundleEncoder::draw(uint32_t vertexCount,
                                  std::optional<uint32_t> instanceCount,
                                  std::optional<uint32_t> firstVertex,
                                  std::optional<uint32_t> firstInstance) {
  _instance.Draw(vertexCount, instanceCount.value_or(1),
                 firstVertex.value_or(0), firstInstance.value_or(0));
}

void GPURenderBundleEncoder::setVertexBuffer(
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

void GPURenderBundleEncoder::setBindGroup(
    uint32_t groupIndex,
    std::variant<std::nullptr_t, std::shared_ptr<GPUBindGroup>> bindGroup,
    std::optional<std::vector<uint32_t>> dynamicOffsets) {
  auto dynOffsets = dynamicOffsets.value_or(std::vector<uint32_t>());
  if (dynOffsets.size() == 0) {
    if (std::holds_alternative<std::nullptr_t>(bindGroup)) {
      _instance.SetBindGroup(groupIndex, nullptr, 0, nullptr);
    } else {
      auto group = std::get<std::shared_ptr<GPUBindGroup>>(bindGroup);
      _instance.SetBindGroup(groupIndex, group->get(), 0, nullptr);
    }
  } else {
    if (std::holds_alternative<std::nullptr_t>(bindGroup)) {
      _instance.SetBindGroup(groupIndex, nullptr, dynOffsets.size(),
                             dynamicOffsets->data());
    } else {
      auto group = std::get<std::shared_ptr<GPUBindGroup>>(bindGroup);
      _instance.SetBindGroup(groupIndex, group->get(), dynOffsets.size(),
                             dynamicOffsets->data());
    }
  }
}

void GPURenderBundleEncoder::setIndexBuffer(std::shared_ptr<GPUBuffer> buffer,
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

void GPURenderBundleEncoder::drawIndexed(
    uint32_t indexCount, std::optional<uint32_t> instanceCount,
    std::optional<uint32_t> firstIndex, std::optional<double> baseVertex,
    std::optional<uint32_t> firstInstance) {
  _instance.DrawIndexed(indexCount, instanceCount.value_or(1),
                        firstIndex.value_or(0), baseVertex.value_or(0),
                        firstInstance.value_or(0));
}

void GPURenderBundleEncoder::pushDebugGroup(std::string groupLabel) {
  _instance.PushDebugGroup(groupLabel.c_str());
}

void GPURenderBundleEncoder::popDebugGroup() { _instance.PopDebugGroup(); }

void GPURenderBundleEncoder::insertDebugMarker(std::string markerLabel) {
  _instance.InsertDebugMarker(markerLabel.c_str());
}
void GPURenderBundleEncoder::drawIndirect(
    std::shared_ptr<GPUBuffer> indirectBuffer, uint64_t indirectOffset) {
  Convertor conv;
  wgpu::Buffer b{};
  if (!conv(b, indirectBuffer)) {
    return;
  }
  _instance.DrawIndirect(b, indirectOffset);
}
void GPURenderBundleEncoder::drawIndexedIndirect(
    std::shared_ptr<GPUBuffer> indirectBuffer, uint64_t indirectOffset) {
  Convertor conv;
  wgpu::Buffer b{};
  if (!conv(b, indirectBuffer)) {
    return;
  }
  _instance.DrawIndexedIndirect(b, indirectOffset);
}
} // namespace rnwgpu
