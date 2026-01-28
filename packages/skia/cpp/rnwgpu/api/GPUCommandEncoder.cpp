#include "GPUCommandEncoder.h"

#include <memory>
#include <string>
#include <vector>

#include "Convertors.h"

namespace rnwgpu {

void GPUCommandEncoder::copyBufferToBuffer(
    std::shared_ptr<GPUBuffer> source, uint64_t sourceOffset,
    std::shared_ptr<GPUBuffer> destination, uint64_t destinationOffset,
    uint64_t size) {
  Convertor conv;

  wgpu::Buffer src{};
  wgpu::Buffer dst{};
  if (!conv(src, source) || //
      !conv(dst, destination)) {
    return;
  }
  _instance.CopyBufferToBuffer(src, sourceOffset, dst, destinationOffset, size);
}

std::shared_ptr<GPUCommandBuffer> GPUCommandEncoder::finish(
    std::optional<std::shared_ptr<GPUCommandBufferDescriptor>> descriptor) {
  wgpu::CommandBufferDescriptor desc{};
  Convertor conv;
  if (!conv(desc, descriptor)) {
    throw std::runtime_error(
        "GPUCommandEncoder::finish(): error with GPUCommandBufferDescriptor");
  }
  auto commandBuffer = _instance.Finish(&desc);
  return std::make_shared<GPUCommandBuffer>(
      commandBuffer,
      descriptor.has_value() ? descriptor.value()->label.value_or("") : "");
}

std::shared_ptr<GPURenderPassEncoder> GPUCommandEncoder::beginRenderPass(
    std::shared_ptr<GPURenderPassDescriptor> descriptor) {

  wgpu::RenderPassDescriptor desc{};
  wgpu::RenderPassMaxDrawCount maxDrawCountDesc{};
  desc.nextInChain = &maxDrawCountDesc;
  Convertor conv;

  // TODO: why is this not in Converter
  if (!conv(desc.colorAttachments, desc.colorAttachmentCount,
            descriptor->colorAttachments) ||
      !conv(desc.depthStencilAttachment, descriptor->depthStencilAttachment) ||
      !conv(desc.label, descriptor->label) ||
      !conv(desc.occlusionQuerySet, descriptor->occlusionQuerySet) ||
      !conv(desc.timestampWrites, descriptor->timestampWrites) ||
      !conv(maxDrawCountDesc.maxDrawCount, descriptor->maxDrawCount)) {
    throw std::runtime_error("PUCommandEncoder::beginRenderPass(): couldn't "
                             "get GPURenderPassDescriptor");
  }
  auto renderPass = _instance.BeginRenderPass(&desc);
  return std::make_shared<GPURenderPassEncoder>(renderPass,
                                                descriptor->label.value_or(""));
}

void GPUCommandEncoder::copyTextureToBuffer(
    std::shared_ptr<GPUImageCopyTexture> source,
    std::shared_ptr<GPUImageCopyBuffer> destination,
    std::shared_ptr<GPUExtent3D> copySize) {
  Convertor conv;
  wgpu::TexelCopyTextureInfo src{};
  wgpu::TexelCopyBufferInfo dst{};
  wgpu::Extent3D size{};
  if (!conv(src, source) ||      //
      !conv(dst, destination) || //
      !conv(size, copySize)) {
    return;
  }
  _instance.CopyTextureToBuffer(&src, &dst, &size);
}

void GPUCommandEncoder::copyTextureToTexture(
    std::shared_ptr<GPUImageCopyTexture> source,
    std::shared_ptr<GPUImageCopyTexture> destination,
    std::shared_ptr<GPUExtent3D> copySize) {
  Convertor conv;

  wgpu::TexelCopyTextureInfo src{};
  wgpu::TexelCopyTextureInfo dst{};
  wgpu::Extent3D size{};
  if (!conv(src, source) ||      //
      !conv(dst, destination) || //
      !conv(size, copySize)) {
    return;
  }

  _instance.CopyTextureToTexture(&src, &dst, &size);
}

std::shared_ptr<GPUComputePassEncoder> GPUCommandEncoder::beginComputePass(
    std::optional<std::shared_ptr<GPUComputePassDescriptor>> descriptor) {
  wgpu::ComputePassDescriptor desc;
  Convertor conv;
  if (!conv(desc, descriptor)) {
    throw std::runtime_error("GPUCommandEncoder.beginComputePass(): couldn't "
                             "access GPUComputePassDescriptor.");
  }
  auto computePass = _instance.BeginComputePass(&desc);
  return std::make_shared<GPUComputePassEncoder>(
      computePass,
      descriptor.has_value() ? descriptor.value()->label.value_or("") : "");
}

void GPUCommandEncoder::resolveQuerySet(std::shared_ptr<GPUQuerySet> querySet,
                                        uint32_t firstQuery,
                                        uint32_t queryCount,
                                        std::shared_ptr<GPUBuffer> destination,
                                        uint64_t destinationOffset) {
  Convertor conv;

  wgpu::QuerySet q{};
  uint32_t f = 0;
  uint32_t c = 0;
  wgpu::Buffer b{};
  uint64_t o = 0;

  if (!conv(q, querySet) ||    //
      !conv(f, firstQuery) ||  //
      !conv(c, queryCount) ||  //
      !conv(b, destination) || //
      !conv(o, destinationOffset)) {
    return;
  }

  _instance.ResolveQuerySet(q, f, c, b, o);
}

void GPUCommandEncoder::copyBufferToTexture(
    std::shared_ptr<GPUImageCopyBuffer> source,
    std::shared_ptr<GPUImageCopyTexture> destination,
    std::shared_ptr<GPUExtent3D> copySize) {
  Convertor conv;

  wgpu::TexelCopyBufferInfo src{};
  wgpu::TexelCopyTextureInfo dst{};
  wgpu::Extent3D size{};
  if (!conv(src, source) ||      //
      !conv(dst, destination) || //
      !conv(size, copySize)) {
    return;
  }

  _instance.CopyBufferToTexture(&src, &dst, &size);
}

void GPUCommandEncoder::clearBuffer(std::shared_ptr<GPUBuffer> buffer,
                                    std::optional<uint64_t> offset,
                                    std::optional<uint64_t> size) {
  Convertor conv;

  wgpu::Buffer b{};
  uint64_t s = wgpu::kWholeSize;
  if (!conv(b, buffer) || //
      !conv(s, size)) {
    return;
  }

  _instance.ClearBuffer(b, offset.value_or(0), s);
}

void GPUCommandEncoder::pushDebugGroup(std::string groupLabel) {
  _instance.PushDebugGroup(groupLabel.c_str());
}

void GPUCommandEncoder::popDebugGroup() { _instance.PopDebugGroup(); }

void GPUCommandEncoder::insertDebugMarker(std::string markerLabel) {
  _instance.InsertDebugMarker(markerLabel.c_str());
}

} // namespace rnwgpu
