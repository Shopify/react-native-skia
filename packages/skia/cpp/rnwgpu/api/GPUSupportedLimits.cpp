#include "GPUSupportedLimits.h"

namespace rnwgpu {

double GPUSupportedLimits::getMaxTextureDimension1D() {
  return _instance.maxTextureDimension1D;
}

double GPUSupportedLimits::getMaxTextureDimension2D() {
  return _instance.maxTextureDimension2D;
}

double GPUSupportedLimits::getMaxTextureDimension3D() {
  return _instance.maxTextureDimension3D;
}

double GPUSupportedLimits::getMaxTextureArrayLayers() {
  return _instance.maxTextureArrayLayers;
}

double GPUSupportedLimits::getMaxBindGroups() {
  return _instance.maxBindGroups;
}

double GPUSupportedLimits::getMaxBindGroupsPlusVertexBuffers() {
  return _instance.maxBindGroupsPlusVertexBuffers;
}

double GPUSupportedLimits::getMaxBindingsPerBindGroup() {
  return _instance.maxBindingsPerBindGroup;
}

double GPUSupportedLimits::getMaxDynamicUniformBuffersPerPipelineLayout() {
  return _instance.maxDynamicUniformBuffersPerPipelineLayout;
}

double GPUSupportedLimits::getMaxDynamicStorageBuffersPerPipelineLayout() {
  return _instance.maxDynamicStorageBuffersPerPipelineLayout;
}

double GPUSupportedLimits::getMaxSampledTexturesPerShaderStage() {
  return _instance.maxSampledTexturesPerShaderStage;
}

double GPUSupportedLimits::getMaxSamplersPerShaderStage() {
  return _instance.maxSamplersPerShaderStage;
}

double GPUSupportedLimits::getMaxStorageBuffersPerShaderStage() {
  return _instance.maxStorageBuffersPerShaderStage;
}

double GPUSupportedLimits::getMaxStorageTexturesPerShaderStage() {
  return _instance.maxStorageTexturesPerShaderStage;
}

double GPUSupportedLimits::getMaxUniformBuffersPerShaderStage() {
  return _instance.maxUniformBuffersPerShaderStage;
}

double GPUSupportedLimits::getMaxUniformBufferBindingSize() {
  return _instance.maxUniformBufferBindingSize;
}

double GPUSupportedLimits::getMaxStorageBufferBindingSize() {
  return _instance.maxStorageBufferBindingSize;
}

double GPUSupportedLimits::getMinUniformBufferOffsetAlignment() {
  return _instance.minUniformBufferOffsetAlignment;
}

double GPUSupportedLimits::getMinStorageBufferOffsetAlignment() {
  return _instance.minStorageBufferOffsetAlignment;
}

double GPUSupportedLimits::getMaxVertexBuffers() {
  return _instance.maxVertexBuffers;
}

double GPUSupportedLimits::getMaxBufferSize() {
  return _instance.maxBufferSize;
}

double GPUSupportedLimits::getMaxVertexAttributes() {
  return _instance.maxVertexAttributes;
}

double GPUSupportedLimits::getMaxVertexBufferArrayStride() {
  return _instance.maxVertexBufferArrayStride;
}

double GPUSupportedLimits::getMaxInterStageShaderVariables() {
  return _instance.maxInterStageShaderVariables;
}

double GPUSupportedLimits::getMaxColorAttachments() {
  return _instance.maxColorAttachments;
}

double GPUSupportedLimits::getMaxColorAttachmentBytesPerSample() {
  return _instance.maxColorAttachmentBytesPerSample;
}

double GPUSupportedLimits::getMaxComputeWorkgroupStorageSize() {
  return _instance.maxComputeWorkgroupStorageSize;
}

double GPUSupportedLimits::getMaxComputeInvocationsPerWorkgroup() {
  return _instance.maxComputeInvocationsPerWorkgroup;
}

double GPUSupportedLimits::getMaxComputeWorkgroupSizeX() {
  return _instance.maxComputeWorkgroupSizeX;
}

double GPUSupportedLimits::getMaxComputeWorkgroupSizeY() {
  return _instance.maxComputeWorkgroupSizeY;
}

double GPUSupportedLimits::getMaxComputeWorkgroupSizeZ() {
  return _instance.maxComputeWorkgroupSizeZ;
}

double GPUSupportedLimits::getMaxComputeWorkgroupsPerDimension() {
  return _instance.maxComputeWorkgroupsPerDimension;
}

} // namespace rnwgpu
