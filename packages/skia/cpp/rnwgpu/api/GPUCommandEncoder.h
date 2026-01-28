#pragma once

#include <memory>
#include <string>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

#include "GPUBuffer.h"
#include "GPUCommandBuffer.h"
#include "descriptors/GPUCommandBufferDescriptor.h"
#include "descriptors/GPUComputePassDescriptor.h"
#include "GPUComputePassEncoder.h"
#include "GPUExtent3D.h"
#include "descriptors/GPUImageCopyBuffer.h"
#include "descriptors/GPUImageCopyTexture.h"
#include "GPUQuerySet.h"
#include "descriptors/GPURenderPassDescriptor.h"
#include "GPURenderPassEncoder.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUCommandEncoder : public NativeObject<GPUCommandEncoder> {
public:
  static constexpr const char *CLASS_NAME = "GPUCommandEncoder";

  explicit GPUCommandEncoder(wgpu::CommandEncoder instance, std::string label)
      : NativeObject(CLASS_NAME), _instance(instance), _label(label) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  std::shared_ptr<GPURenderPassEncoder>
  beginRenderPass(std::shared_ptr<GPURenderPassDescriptor> descriptor);
  std::shared_ptr<GPUComputePassEncoder> beginComputePass(
      std::optional<std::shared_ptr<GPUComputePassDescriptor>> descriptor);
  void copyBufferToBuffer(std::shared_ptr<GPUBuffer> source,
                          uint64_t sourceOffset,
                          std::shared_ptr<GPUBuffer> destination,
                          uint64_t destinationOffset, uint64_t size);
  void copyBufferToTexture(std::shared_ptr<GPUImageCopyBuffer> source,
                           std::shared_ptr<GPUImageCopyTexture> destination,
                           std::shared_ptr<GPUExtent3D> copySize);
  void copyTextureToBuffer(std::shared_ptr<GPUImageCopyTexture> source,
                           std::shared_ptr<GPUImageCopyBuffer> destination,
                           std::shared_ptr<GPUExtent3D> copySize);
  void copyTextureToTexture(std::shared_ptr<GPUImageCopyTexture> source,
                            std::shared_ptr<GPUImageCopyTexture> destination,
                            std::shared_ptr<GPUExtent3D> copySize);
  void clearBuffer(std::shared_ptr<GPUBuffer> buffer,
                   std::optional<uint64_t> offset,
                   std::optional<uint64_t> size);
  void resolveQuerySet(std::shared_ptr<GPUQuerySet> querySet,
                       uint32_t firstQuery, uint32_t queryCount,
                       std::shared_ptr<GPUBuffer> destination,
                       uint64_t destinationOffset);
  std::shared_ptr<GPUCommandBuffer>
  finish(std::optional<std::shared_ptr<GPUCommandBufferDescriptor>> descriptor);
  void pushDebugGroup(std::string groupLabel);
  void popDebugGroup();
  void insertDebugMarker(std::string markerLabel);

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUCommandEncoder::getBrand);
    installMethod(runtime, prototype, "beginRenderPass",
                  &GPUCommandEncoder::beginRenderPass);
    installMethod(runtime, prototype, "beginComputePass",
                  &GPUCommandEncoder::beginComputePass);
    installMethod(runtime, prototype, "copyBufferToBuffer",
                  &GPUCommandEncoder::copyBufferToBuffer);
    installMethod(runtime, prototype, "copyBufferToTexture",
                  &GPUCommandEncoder::copyBufferToTexture);
    installMethod(runtime, prototype, "copyTextureToBuffer",
                  &GPUCommandEncoder::copyTextureToBuffer);
    installMethod(runtime, prototype, "copyTextureToTexture",
                  &GPUCommandEncoder::copyTextureToTexture);
    installMethod(runtime, prototype, "clearBuffer",
                  &GPUCommandEncoder::clearBuffer);
    installMethod(runtime, prototype, "resolveQuerySet",
                  &GPUCommandEncoder::resolveQuerySet);
    installMethod(runtime, prototype, "finish", &GPUCommandEncoder::finish);
    installMethod(runtime, prototype, "pushDebugGroup",
                  &GPUCommandEncoder::pushDebugGroup);
    installMethod(runtime, prototype, "popDebugGroup",
                  &GPUCommandEncoder::popDebugGroup);
    installMethod(runtime, prototype, "insertDebugMarker",
                  &GPUCommandEncoder::insertDebugMarker);
    installGetterSetter(runtime, prototype, "label",
                        &GPUCommandEncoder::getLabel,
                        &GPUCommandEncoder::setLabel);
  }

  inline const wgpu::CommandEncoder get() { return _instance; }

private:
  wgpu::CommandEncoder _instance;
  std::string _label;
};

} // namespace rnwgpu
