#pragma once

#include <string>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUSupportedLimits : public NativeObject<GPUSupportedLimits> {
public:
  static constexpr const char *CLASS_NAME = "GPUSupportedLimits";

  explicit GPUSupportedLimits(wgpu::Limits instance)
      : NativeObject(CLASS_NAME), _instance(instance) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  double getMaxTextureDimension1D();
  double getMaxTextureDimension2D();
  double getMaxTextureDimension3D();
  double getMaxTextureArrayLayers();
  double getMaxBindGroups();
  double getMaxBindGroupsPlusVertexBuffers();
  double getMaxBindingsPerBindGroup();
  double getMaxDynamicUniformBuffersPerPipelineLayout();
  double getMaxDynamicStorageBuffersPerPipelineLayout();
  double getMaxSampledTexturesPerShaderStage();
  double getMaxSamplersPerShaderStage();
  double getMaxStorageBuffersPerShaderStage();
  double getMaxStorageTexturesPerShaderStage();
  double getMaxUniformBuffersPerShaderStage();
  double getMaxUniformBufferBindingSize();
  double getMaxStorageBufferBindingSize();
  double getMinUniformBufferOffsetAlignment();
  double getMinStorageBufferOffsetAlignment();
  double getMaxVertexBuffers();
  double getMaxBufferSize();
  double getMaxVertexAttributes();
  double getMaxVertexBufferArrayStride();
  double getMaxInterStageShaderVariables();
  double getMaxColorAttachments();
  double getMaxColorAttachmentBytesPerSample();
  double getMaxComputeWorkgroupStorageSize();
  double getMaxComputeInvocationsPerWorkgroup();
  double getMaxComputeWorkgroupSizeX();
  double getMaxComputeWorkgroupSizeY();
  double getMaxComputeWorkgroupSizeZ();
  double getMaxComputeWorkgroupsPerDimension();

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUSupportedLimits::getBrand);
    installGetter(runtime, prototype, "maxTextureDimension1D",
                  &GPUSupportedLimits::getMaxTextureDimension1D);
    installGetter(runtime, prototype, "maxTextureDimension2D",
                  &GPUSupportedLimits::getMaxTextureDimension2D);
    installGetter(runtime, prototype, "maxTextureDimension3D",
                  &GPUSupportedLimits::getMaxTextureDimension3D);
    installGetter(runtime, prototype, "maxTextureArrayLayers",
                  &GPUSupportedLimits::getMaxTextureArrayLayers);
    installGetter(runtime, prototype, "maxBindGroups",
                  &GPUSupportedLimits::getMaxBindGroups);
    installGetter(runtime, prototype, "maxBindGroupsPlusVertexBuffers",
                  &GPUSupportedLimits::getMaxBindGroupsPlusVertexBuffers);
    installGetter(runtime, prototype, "maxBindingsPerBindGroup",
                  &GPUSupportedLimits::getMaxBindingsPerBindGroup);
    installGetter(
        runtime, prototype, "maxDynamicUniformBuffersPerPipelineLayout",
        &GPUSupportedLimits::getMaxDynamicUniformBuffersPerPipelineLayout);
    installGetter(
        runtime, prototype, "maxDynamicStorageBuffersPerPipelineLayout",
        &GPUSupportedLimits::getMaxDynamicStorageBuffersPerPipelineLayout);
    installGetter(runtime, prototype, "maxSampledTexturesPerShaderStage",
                  &GPUSupportedLimits::getMaxSampledTexturesPerShaderStage);
    installGetter(runtime, prototype, "maxSamplersPerShaderStage",
                  &GPUSupportedLimits::getMaxSamplersPerShaderStage);
    installGetter(runtime, prototype, "maxStorageBuffersPerShaderStage",
                  &GPUSupportedLimits::getMaxStorageBuffersPerShaderStage);
    installGetter(runtime, prototype, "maxStorageTexturesPerShaderStage",
                  &GPUSupportedLimits::getMaxStorageTexturesPerShaderStage);
    installGetter(runtime, prototype, "maxUniformBuffersPerShaderStage",
                  &GPUSupportedLimits::getMaxUniformBuffersPerShaderStage);
    installGetter(runtime, prototype, "maxUniformBufferBindingSize",
                  &GPUSupportedLimits::getMaxUniformBufferBindingSize);
    installGetter(runtime, prototype, "maxStorageBufferBindingSize",
                  &GPUSupportedLimits::getMaxStorageBufferBindingSize);
    installGetter(runtime, prototype, "minUniformBufferOffsetAlignment",
                  &GPUSupportedLimits::getMinUniformBufferOffsetAlignment);
    installGetter(runtime, prototype, "minStorageBufferOffsetAlignment",
                  &GPUSupportedLimits::getMinStorageBufferOffsetAlignment);
    installGetter(runtime, prototype, "maxVertexBuffers",
                  &GPUSupportedLimits::getMaxVertexBuffers);
    installGetter(runtime, prototype, "maxBufferSize",
                  &GPUSupportedLimits::getMaxBufferSize);
    installGetter(runtime, prototype, "maxVertexAttributes",
                  &GPUSupportedLimits::getMaxVertexAttributes);
    installGetter(runtime, prototype, "maxVertexBufferArrayStride",
                  &GPUSupportedLimits::getMaxVertexBufferArrayStride);
    installGetter(runtime, prototype, "maxInterStageShaderVariables",
                  &GPUSupportedLimits::getMaxInterStageShaderVariables);
    installGetter(runtime, prototype, "maxColorAttachments",
                  &GPUSupportedLimits::getMaxColorAttachments);
    installGetter(runtime, prototype, "maxColorAttachmentBytesPerSample",
                  &GPUSupportedLimits::getMaxColorAttachmentBytesPerSample);
    installGetter(runtime, prototype, "maxComputeWorkgroupStorageSize",
                  &GPUSupportedLimits::getMaxComputeWorkgroupStorageSize);
    installGetter(runtime, prototype, "maxComputeInvocationsPerWorkgroup",
                  &GPUSupportedLimits::getMaxComputeInvocationsPerWorkgroup);
    installGetter(runtime, prototype, "maxComputeWorkgroupSizeX",
                  &GPUSupportedLimits::getMaxComputeWorkgroupSizeX);
    installGetter(runtime, prototype, "maxComputeWorkgroupSizeY",
                  &GPUSupportedLimits::getMaxComputeWorkgroupSizeY);
    installGetter(runtime, prototype, "maxComputeWorkgroupSizeZ",
                  &GPUSupportedLimits::getMaxComputeWorkgroupSizeZ);
    installGetter(runtime, prototype, "maxComputeWorkgroupsPerDimension",
                  &GPUSupportedLimits::getMaxComputeWorkgroupsPerDimension);
  }

  inline const wgpu::Limits get() { return _instance; }

private:
  wgpu::Limits _instance;
};

} // namespace rnwgpu
