#pragma once

#include <map>
#include <memory>
#include <optional>
#include <string>
#include <utility>
#include <variant>
#include <vector>

#include "webgpu/webgpu_cpp.h"

#include "descriptors/GPUBindGroupDescriptor.h"
#include "descriptors/GPUBindGroupEntry.h"
#include "descriptors/GPUBindGroupLayoutDescriptor.h"
#include "descriptors/GPUBindGroupLayoutEntry.h"
#include "descriptors/GPUBlendComponent.h"
#include "descriptors/GPUBlendState.h"
#include "descriptors/GPUBufferBinding.h"
#include "descriptors/GPUBufferBindingLayout.h"
#include "descriptors/GPUBufferDescriptor.h"
#include "descriptors/GPUColor.h"
#include "descriptors/GPUColorTargetState.h"
#include "descriptors/GPUCommandBufferDescriptor.h"
#include "descriptors/GPUCommandEncoderDescriptor.h"
#include "descriptors/GPUComputePassDescriptor.h"
#include "descriptors/GPUComputePassTimestampWrites.h"
#include "descriptors/GPUComputePipelineDescriptor.h"
#include "descriptors/GPUDepthStencilState.h"
#include "descriptors/GPUDeviceDescriptor.h"
#include "descriptors/GPUExternalTextureBindingLayout.h"
#include "descriptors/GPUFragmentState.h"
#include "descriptors/GPUImageCopyBuffer.h"
#include "descriptors/GPUImageCopyTexture.h"
#include "descriptors/GPUImageCopyTextureTagged.h"
#include "descriptors/GPUImageDataLayout.h"
#include "descriptors/GPUMultisampleState.h"
#include "descriptors/GPUPipelineLayoutDescriptor.h"
#include "descriptors/GPUPrimitiveState.h"
#include "descriptors/GPUProgrammableStage.h"
#include "descriptors/GPUQuerySetDescriptor.h"
#include "descriptors/GPUQueueDescriptor.h"
#include "descriptors/GPURenderBundleDescriptor.h"
#include "descriptors/GPURenderBundleEncoderDescriptor.h"
#include "descriptors/GPURenderPassColorAttachment.h"
#include "descriptors/GPURenderPassDepthStencilAttachment.h"
#include "descriptors/GPURenderPassDescriptor.h"
#include "descriptors/GPURenderPassTimestampWrites.h"
#include "descriptors/GPURenderPipelineDescriptor.h"
#include "descriptors/GPURequestAdapterOptions.h"
#include "descriptors/GPUSamplerBindingLayout.h"
#include "descriptors/GPUSamplerDescriptor.h"
#include "descriptors/GPUShaderModuleCompilationHint.h"
#include "descriptors/GPUShaderModuleDescriptor.h"
#include "descriptors/GPUStencilFaceState.h"
#include "descriptors/GPUStorageTextureBindingLayout.h"
#include "descriptors/GPUTextureBindingLayout.h"
#include "descriptors/GPUTextureDescriptor.h"
#include "descriptors/GPUTextureViewDescriptor.h"
#include "descriptors/GPUVertexAttribute.h"
#include "descriptors/GPUVertexBufferLayout.h"
#include "descriptors/GPUVertexState.h"
#include "descriptors/Unions.h"

namespace rnwgpu {

class Convertor {
public:
  ~Convertor() {
    for (auto &free : free_) {
      free();
    }
  }

  template <typename OUT, typename IN>
  [[nodiscard]] inline bool operator()(OUT &&out, IN &&in) {
    return Convert(std::forward<OUT>(out), std::forward<IN>(in));
  }

  template <typename OUT, typename IN>
  [[nodiscard]] inline bool operator()(OUT *&out_els, size_t &out_count,
                                       const std::vector<IN> &in) {
    return Convert(out_els, out_count, in);
  }

  template <typename OUT, typename IN>
  [[nodiscard]] inline bool Convert(OUT *&out_els, size_t &out_count,
                                    const std::optional<std::vector<IN>> &in) {
    if (!in.has_value()) {
      out_els = nullptr;
      out_count = 0;
      return true;
    }
    return Convert(out_els, out_count, in.value());
  }

  template <typename OUT, typename IN>
  [[nodiscard]] inline bool Convert(OUT *&out_els, size_t &out_count,
                                    const std::vector<IN> &in) {
    if (in.size() == 0) {
      out_els = nullptr;
      out_count = 0;
      return true;
    }
    auto *els = Allocate<std::remove_const_t<OUT>>(in.size());
    for (size_t i = 0; i < in.size(); i++) {
      if (!Convert(els[i], in[i])) {
        return false;
      }
    }
    out_els = els;
    return Convert(out_count, in.size());
  }

  template <typename OUT, typename IN>
  [[nodiscard]] inline bool
  Convert(OUT *&out_els, size_t &out_count,
          const std::vector<std::variant<std::nullptr_t, IN>> &in) {
    std::vector<IN> filtered;
    filtered.reserve(in.size());

    for (const auto &item : in) {
      if (auto ptr = std::get_if<IN>(&item)) {
        filtered.push_back(*ptr);
      }
    }

    return Convert(out_els, out_count, filtered);
  }

  template <typename OUT, typename INKEY, typename INVALUE>
  [[nodiscard]] inline bool
  Convert(OUT *&out_els, size_t &out_count,
          const std::optional<std::map<INKEY, INVALUE>> &in) {
    if (!in.has_value() || in.value().size() == 0) {
      out_els = nullptr;
      out_count = 0;
      return true;
    }
    auto val = in.value();
    auto *els = Allocate<std::remove_const_t<OUT>>(val.size());
    size_t i = 0;
    for (const auto &item : val) {
      if (!Convert(els[i], item.first, item.second)) {
        return false;
      }
      i++;
    }
    out_els = els;
    return Convert(out_count, val.size());
  }

  template <typename T>
  [[nodiscard]] auto Convert(T &out, const std::nullptr_t &in) {
    out = nullptr;
    return true;
  }

  [[nodiscard]] bool Convert(wgpu::Bool &out, const bool &in) {
    out = in;
    return true;
  }

  template <typename T>
  [[nodiscard]] typename std::enable_if<
      (std::is_arithmetic<T>::value || std::is_enum<T>::value), bool>::type
  Convert(T &out, const double &in) {
    out = static_cast<T>(in);
    return true;
  }

  template <typename T>
  [[nodiscard]] typename std::enable_if<std::is_enum<T>::value, bool>::type
  Convert(T &out, const T &in) {
    out = in;
    return true;
  }

  [[nodiscard]] bool Convert(wgpu::OptionalBool &out,
                             const std::optional<bool> &in) {
    out = in;
    return true;
  }

  [[nodiscard]] bool Convert(wgpu::StringView &out, const std::string &in) {
    out = {in.data(), in.size()};
    return true;
  }

  [[nodiscard]] bool Convert(const char *&out, const std::string &in) {
    out = in.c_str();
    return true;
  }

  template <typename OUT, typename IN>
  [[nodiscard]] bool Convert(OUT &out, const std::optional<IN> &in) {
    if (in.has_value()) {
      return Convert(out, in.value());
    }
    return true;
  }

  template <typename T, typename = void>
  struct has_get_member : std::false_type {};

  template <typename T>
  struct has_get_member<T, std::void_t<decltype(std::declval<T>().get())>>
      : std::true_type {};

  template <typename OUT, typename IN>
  [[nodiscard]] bool Convert(OUT &out, const std::shared_ptr<IN> &in) {
    if constexpr (has_get_member<IN>::value) {
      out = in->get();
      return true;
    } else {
      return Convert(out, *in);
    }
  }

  template <typename OUT, typename IN,
            typename _ = std::enable_if_t<!std::is_same_v<IN, std::string>>>
  [[nodiscard]] inline bool Convert(OUT *&out, const std::optional<IN> &in) {
    if (in.has_value()) {
      auto *el = Allocate<std::remove_const_t<OUT>>();
      if (!Convert(*el, in.value())) {
        return false;
      }
      out = el;
    } else {
      out = nullptr;
    }
    return true;
  }

  template <typename OUT, typename IN>
  [[nodiscard]] bool Convert(OUT &out,
                             const std::variant<std::nullptr_t, IN> &in) {
    if (std::holds_alternative<std::nullptr_t>(in)) {
      return Convert(out, std::get<std::nullptr_t>(in));
    }
    return Convert(out, std::get<IN>(in));
  }

  [[nodiscard]] bool Convert(wgpu::Origin3D &out, const GPUOrigin3D &in) {
    return Convert(out.x, in.x) && Convert(out.y, in.y) && Convert(out.z, in.z);
  }

  [[nodiscard]] bool Convert(wgpu::Extent3D &out, const GPUExtent3D &in) {
    return Convert(out.width, in.width) && Convert(out.height, in.height) &&
           Convert(out.depthOrArrayLayers, in.depthOrArrayLayers);
  }

  [[nodiscard]] bool Convert(wgpu::BindGroupLayoutEntry &out,
                             const GPUBindGroupLayoutEntry &in) {
    return Convert(out.binding, in.binding) &&
           Convert(out.visibility, in.visibility) &&
           Convert(out.buffer, in.buffer) && Convert(out.sampler, in.sampler) &&
           Convert(out.texture, in.texture) &&
           Convert(out.storageTexture, in.storageTexture);
    // no external textures here
    //&& Convert(out.externalTexture, in.externalTexture);
  }

  [[nodiscard]] bool Convert(wgpu::BlendComponent &out,
                             const GPUBlendComponent &in) {
    out = {};
    return Convert(out.operation, in.operation) &&
           Convert(out.dstFactor, in.dstFactor) &&
           Convert(out.srcFactor, in.srcFactor);
  }

  [[nodiscard]] bool Convert(wgpu::BlendState &out, const GPUBlendState &in) {
    out = {};
    return Convert(out.alpha, in.alpha) && Convert(out.color, in.color);
  }

  [[nodiscard]] bool Convert(wgpu::BufferBindingLayout &out,
                             const GPUBufferBindingLayout &in) {
    // here the buffer property is set so type is set to its default value
    if (!in.type.has_value()) {
      out.type = wgpu::BufferBindingType::Uniform;
    }
    return Convert(out.type, in.type) &&
           Convert(out.hasDynamicOffset, in.hasDynamicOffset) &&
           Convert(out.minBindingSize, in.minBindingSize);
  }

  [[nodiscard]] bool Convert(wgpu::BufferDescriptor &out,
                             const GPUBufferDescriptor &in) {
    return Convert(out.size, in.size) && Convert(out.usage, in.usage) &&
           Convert(out.mappedAtCreation, in.mappedAtCreation) &&
           Convert(out.label, in.label);
  }

  [[nodiscard]] bool Convert(wgpu::Color &out, const GPUColor &in) {
    return Convert(out.r, in.r) && Convert(out.g, in.g) &&
           Convert(out.b, in.b) && Convert(out.a, in.a);
  }

  [[nodiscard]] bool Convert(wgpu::ColorTargetState &out,
                             const GPUColorTargetState &in) {
    out = {};
    return Convert(out.blend, in.blend) && Convert(out.format, in.format) &&
           Convert(out.writeMask, in.writeMask);
  }

  [[nodiscard]] bool Convert(wgpu::ComputePassDescriptor &out,
                             const GPUComputePassDescriptor &in) {
    return Convert(out.timestampWrites, in.timestampWrites) &&
           Convert(out.label, in.label);
  }

  [[nodiscard]] bool Convert(wgpu::PassTimestampWrites &out,
                             const GPUComputePassTimestampWrites &in) {
    return Convert(out.querySet, in.querySet) &&
           Convert(out.beginningOfPassWriteIndex,
                   in.beginningOfPassWriteIndex) &&
           Convert(out.endOfPassWriteIndex, in.endOfPassWriteIndex);
  }

  [[nodiscard]] bool Convert(wgpu::ComputePipelineDescriptor &out,
                             const GPUComputePipelineDescriptor &in) {
    return Convert(out.compute, in.compute) && Convert(out.layout, in.layout) &&
           Convert(out.label, in.label);
  }

  [[nodiscard]] bool Convert(wgpu::DepthStencilState &out,
                             const GPUDepthStencilState &in) {
    return Convert(out.format, in.format) &&
           Convert(out.depthWriteEnabled, in.depthWriteEnabled) &&
           Convert(out.depthCompare, in.depthCompare) &&
           Convert(out.stencilFront, in.stencilFront) &&
           Convert(out.stencilBack, in.stencilBack) &&
           Convert(out.stencilReadMask, in.stencilReadMask) &&
           Convert(out.stencilWriteMask, in.stencilWriteMask) &&
           Convert(out.depthBias, in.depthBias) &&
           Convert(out.depthBiasSlopeScale, in.depthBiasSlopeScale) &&
           Convert(out.depthBiasClamp, in.depthBiasClamp);
  }

  [[nodiscard]] bool Convert(wgpu::DeviceDescriptor &out,
                             const GPUDeviceDescriptor &in) {
    if (in.requiredFeatures.has_value()) {
      if (!Convert(out.requiredFeatures, out.requiredFeatureCount,
                   in.requiredFeatures.value())) {
        return false;
      }
    }

    if (in.requiredLimits.has_value()) {
      const auto &limits = in.requiredLimits.value();
      auto *requiredLimits = Allocate<wgpu::Limits>();
      for (const auto &[key, value] : limits) {
        if (key == "maxTextureDimension1D") {
          requiredLimits->maxTextureDimension1D = value;
        } else if (key == "maxTextureDimension2D") {
          requiredLimits->maxTextureDimension2D = value;
        } else if (key == "maxTextureDimension3D") {
          requiredLimits->maxTextureDimension3D = value;
        } else if (key == "maxTextureArrayLayers") {
          requiredLimits->maxTextureArrayLayers = value;
        } else if (key == "maxBindGroups") {
          requiredLimits->maxBindGroups = value;
        } else if (key == "maxBindGroupsPlusVertexBuffers") {
          requiredLimits->maxBindGroupsPlusVertexBuffers = value;
        } else if (key == "maxBindingsPerBindGroup") {
          requiredLimits->maxBindingsPerBindGroup = value;
        } else if (key == "maxDynamicUniformBuffersPerPipelineLayout") {
          requiredLimits->maxDynamicUniformBuffersPerPipelineLayout = value;
        } else if (key == "maxDynamicStorageBuffersPerPipelineLayout") {
          requiredLimits->maxDynamicStorageBuffersPerPipelineLayout = value;
        } else if (key == "maxSampledTexturesPerShaderStage") {
          requiredLimits->maxSampledTexturesPerShaderStage = value;
        } else if (key == "maxSamplersPerShaderStage") {
          requiredLimits->maxSamplersPerShaderStage = value;
        } else if (key == "maxStorageBuffersPerShaderStage") {
          requiredLimits->maxStorageBuffersPerShaderStage = value;
        } else if (key == "maxStorageTexturesPerShaderStage") {
          requiredLimits->maxStorageTexturesPerShaderStage = value;
        } else if (key == "maxUniformBuffersPerShaderStage") {
          requiredLimits->maxUniformBuffersPerShaderStage = value;
        } else if (key == "maxUniformBufferBindingSize") {
          requiredLimits->maxUniformBufferBindingSize = value;
        } else if (key == "maxStorageBufferBindingSize") {
          requiredLimits->maxStorageBufferBindingSize = value;
        } else if (key == "minUniformBufferOffsetAlignment") {
          requiredLimits->minUniformBufferOffsetAlignment = value;
        } else if (key == "minStorageBufferOffsetAlignment") {
          requiredLimits->minStorageBufferOffsetAlignment = value;
        } else if (key == "maxVertexBuffers") {
          requiredLimits->maxVertexBuffers = value;
        } else if (key == "maxBufferSize") {
          requiredLimits->maxBufferSize = value;
        } else if (key == "maxVertexAttributes") {
          requiredLimits->maxVertexAttributes = value;
        } else if (key == "maxVertexBufferArrayStride") {
          requiredLimits->maxVertexBufferArrayStride = value;
        } else if (key == "maxInterStageShaderVariables") {
          requiredLimits->maxInterStageShaderVariables = value;
        } else if (key == "maxColorAttachments") {
          requiredLimits->maxColorAttachments = value;
        } else if (key == "maxColorAttachmentBytesPerSample") {
          requiredLimits->maxColorAttachmentBytesPerSample = value;
        } else if (key == "maxComputeWorkgroupStorageSize") {
          requiredLimits->maxComputeWorkgroupStorageSize = value;
        } else if (key == "maxComputeInvocationsPerWorkgroup") {
          requiredLimits->maxComputeInvocationsPerWorkgroup = value;
        } else if (key == "maxComputeWorkgroupSizeX") {
          requiredLimits->maxComputeWorkgroupSizeX = value;
        } else if (key == "maxComputeWorkgroupSizeY") {
          requiredLimits->maxComputeWorkgroupSizeY = value;
        } else if (key == "maxComputeWorkgroupSizeZ") {
          requiredLimits->maxComputeWorkgroupSizeZ = value;
        } else if (key == "maxComputeWorkgroupsPerDimension") {
          requiredLimits->maxComputeWorkgroupsPerDimension = value;
        }
      }
      out.requiredLimits = requiredLimits;
    }
    return Convert(out.defaultQueue, in.defaultQueue) &&
           Convert(out.label, in.label);
  }

  [[nodiscard]] bool Convert(wgpu::ExternalTextureBindingLayout &out,
                             const GPUExternalTextureBindingLayout &in) {
    // no external textures at the moment
    return false;
  }

  [[nodiscard]] bool Convert(wgpu::ConstantEntry &out, const std::string &key,
                             const double &value) {
    out.key = ConvertStringReplacingNull(key);
    out.value = value;
    return true;
  }

  [[nodiscard]] bool Convert(wgpu::FragmentState &out,
                             const GPUFragmentState &in) {
    out = {};

    // Replace nulls in the entryPoint name with another character that's
    // disallowed in WGSL identifiers. This is so that using "main\0" doesn't
    // match an entryPoint named "main".
    out.entryPoint = in.entryPoint
                         ? ConvertStringReplacingNull(in.entryPoint.value())
                         : nullptr;
    return Convert(out.targets, out.targetCount, in.targets) && //
           Convert(out.module, in.module) &&
           Convert(out.constants, out.constantCount, in.constants);
  }

  [[nodiscard]] bool Convert(wgpu::TexelCopyBufferInfo &out,
                             const GPUImageCopyBuffer &in) {
    out = {};
    out.buffer = in.buffer->get();
    return Convert(out.layout.offset, in.offset) &&
           Convert(out.layout.bytesPerRow, in.bytesPerRow) &&
           Convert(out.layout.rowsPerImage, in.rowsPerImage);
  }

  [[nodiscard]] bool Convert(wgpu::TexelCopyTextureInfo &out,
                             const GPUImageCopyTexture &in) {
    return Convert(out.origin, in.origin) && Convert(out.texture, in.texture) &&
           Convert(out.mipLevel, in.mipLevel) && Convert(out.aspect, in.aspect);
  }

  [[nodiscard]] bool Convert(wgpu::TexelCopyBufferLayout &out,
                             const GPUImageDataLayout &in) {
    out = {};
    return Convert(out.bytesPerRow, in.bytesPerRow) &&
           Convert(out.offset, in.offset) &&
           Convert(out.rowsPerImage, in.rowsPerImage);
  }

  [[nodiscard]] bool Convert(wgpu::MultisampleState &out,
                             const GPUMultisampleState &in) {
    return Convert(out.count, in.count) && Convert(out.mask, in.mask) &&
           Convert(out.alphaToCoverageEnabled, in.alphaToCoverageEnabled);
  }

  [[nodiscard]] bool Convert(wgpu::PipelineLayoutDescriptor &out,
                             const GPUPipelineLayoutDescriptor &in) {
    return Convert(out.bindGroupLayouts, out.bindGroupLayoutCount,
                   in.bindGroupLayouts) &&
           Convert(out.label, in.label);
  }

  [[nodiscard]] bool Convert(wgpu::PrimitiveState &out,
                             const GPUPrimitiveState &in) {
    out = {};

    if (in.unclippedDepth.has_value()) {
      out.unclippedDepth = in.unclippedDepth.value();
    }

    return Convert(out.topology, in.topology) &&
           Convert(out.stripIndexFormat, in.stripIndexFormat) &&
           Convert(out.frontFace, in.frontFace) &&
           Convert(out.cullMode, in.cullMode);
  }

  [[nodiscard]] bool Convert(wgpu::ComputeState &out,
                             const GPUProgrammableStage &in) {
    out = {};
    out.module = in.module->get();

    // Replace nulls in the entryPoint name with another character that's
    // disallowed in WGSL identifiers. This is so that using "main\0" doesn't
    // match an entryPoint named "main".
    out.entryPoint = in.entryPoint
                         ? ConvertStringReplacingNull(in.entryPoint.value())
                         : nullptr;
    return Convert(out.constants, out.constantCount, in.constants);
  }

  [[nodiscard]] bool Convert(wgpu::QuerySetDescriptor &out,
                             const GPUQuerySetDescriptor &in) {
    return Convert(out.type, in.type) && Convert(out.count, in.count) &&
           Convert(out.label, in.label);
  }

  [[nodiscard]] bool Convert(wgpu::RenderBundleEncoderDescriptor &out,
                             const GPURenderBundleEncoderDescriptor &in) {
    return Convert(out.depthReadOnly, in.depthReadOnly) &&
           Convert(out.stencilReadOnly, in.stencilReadOnly) &&
           Convert(out.colorFormats, out.colorFormatCount, in.colorFormats) &&
           Convert(out.depthStencilFormat, in.depthStencilFormat) &&
           Convert(out.sampleCount, in.sampleCount) &&
           Convert(out.label, in.label);
  }

  [[nodiscard]] bool Convert(wgpu::RenderPassColorAttachment &out,
                             const GPURenderPassColorAttachment &in) {
    return Convert(out.view, in.view) &&
           Convert(out.depthSlice, in.depthSlice) &&
           Convert(out.resolveTarget, in.resolveTarget) &&
           Convert(out.clearValue, in.clearValue) &&
           Convert(out.loadOp, in.loadOp) && Convert(out.storeOp, in.storeOp);
  }

  [[nodiscard]] bool Convert(wgpu::RenderPassDepthStencilAttachment &out,
                             const GPURenderPassDepthStencilAttachment &in) {
    return Convert(out.view, in.view) &&
           Convert(out.depthClearValue, in.depthClearValue) &&
           Convert(out.depthLoadOp, in.depthLoadOp) &&
           Convert(out.depthStoreOp, in.depthStoreOp) &&
           Convert(out.depthReadOnly, in.depthReadOnly) &&
           Convert(out.stencilClearValue, in.stencilClearValue) &&
           Convert(out.stencilLoadOp, in.stencilLoadOp) &&
           Convert(out.stencilStoreOp, in.stencilStoreOp) &&
           Convert(out.stencilReadOnly, in.stencilReadOnly);
  }

  [[nodiscard]] bool Convert(wgpu::PassTimestampWrites &out,
                             const GPURenderPassTimestampWrites &in) {
    return Convert(out.querySet, in.querySet) &&
           Convert(out.beginningOfPassWriteIndex,
                   in.beginningOfPassWriteIndex) &&
           Convert(out.endOfPassWriteIndex, in.endOfPassWriteIndex);
  }

  [[nodiscard]] bool Convert(wgpu::RenderPipelineDescriptor &out,
                             const GPURenderPipelineDescriptor &in) {
    return Convert(out.vertex, in.vertex) &&
           Convert(out.primitive, in.primitive) &&
           Convert(out.depthStencil, in.depthStencil) &&
           Convert(out.multisample, in.multisample) &&
           Convert(out.fragment, in.fragment) &&
           Convert(out.layout, in.layout) && Convert(out.label, in.label);
  }

  [[nodiscard]] bool Convert(wgpu::RequestAdapterOptions &out,
                             const GPURequestAdapterOptions &in) {
    return Convert(out.powerPreference, in.powerPreference) &&
           Convert(out.forceFallbackAdapter, in.forceFallbackAdapter);
  }

  [[nodiscard]] bool Convert(wgpu::SamplerBindingLayout &out,
                             const GPUSamplerBindingLayout &in) {
    // here the buffer property is set so type is set to its default value
    if (!in.type.has_value()) {
      out.type = wgpu::SamplerBindingType::Filtering;
    }
    return Convert(out.type, in.type);
  }

  [[nodiscard]] bool Convert(wgpu::SamplerDescriptor &out,
                             const GPUSamplerDescriptor &in) {
    return Convert(out.addressModeU, in.addressModeU) &&
           Convert(out.addressModeV, in.addressModeV) &&
           Convert(out.addressModeW, in.addressModeW) &&
           Convert(out.magFilter, in.magFilter) &&
           Convert(out.minFilter, in.minFilter) &&
           Convert(out.mipmapFilter, in.mipmapFilter) &&
           Convert(out.lodMinClamp, in.lodMinClamp) &&
           Convert(out.lodMaxClamp, in.lodMaxClamp) &&
           Convert(out.compare, in.compare) &&
           Convert(out.maxAnisotropy, in.maxAnisotropy) &&
           Convert(out.label, in.label);
  }

  [[nodiscard]] bool Convert(wgpu::StencilFaceState &out,
                             const GPUStencilFaceState &in) {
    return Convert(out.compare, in.compare) && Convert(out.failOp, in.failOp) &&
           Convert(out.depthFailOp, in.depthFailOp) &&
           Convert(out.passOp, in.passOp);
  }

  [[nodiscard]] bool Convert(wgpu::StorageTextureBindingLayout &out,
                             const GPUStorageTextureBindingLayout &in) {
    if (!in.access.has_value()) {
      out.access = wgpu::StorageTextureAccess::WriteOnly;
    }
    return Convert(out.access, in.access) && Convert(out.format, in.format) &&
           Convert(out.viewDimension, in.viewDimension);
  }

  [[nodiscard]] bool Convert(wgpu::TextureBindingLayout &out,
                             const GPUTextureBindingLayout &in) {
    if (!in.sampleType.has_value()) {
      out.sampleType = wgpu::TextureSampleType::Float;
    }
    return Convert(out.sampleType, in.sampleType) &&
           Convert(out.viewDimension, in.viewDimension) &&
           Convert(out.multisampled, in.multisampled);
  }

  [[nodiscard]] bool Convert(wgpu::TextureDescriptor &out,
                             const GPUTextureDescriptor &in) {
    if (in.viewFormats.has_value()) {
      if (!Convert(out.viewFormats, out.viewFormatCount,
                   in.viewFormats.value())) {
        return false;
      }
    }
    return Convert(out.size, in.size) &&
           Convert(out.mipLevelCount, in.mipLevelCount) &&
           Convert(out.sampleCount, in.sampleCount) &&
           Convert(out.dimension, in.dimension) &&
           Convert(out.format, in.format) && Convert(out.usage, in.usage) &&
           Convert(out.label, in.label);
  }

  [[nodiscard]] bool Convert(wgpu::TextureViewDescriptor &out,
                             const GPUTextureViewDescriptor &in) {
    return Convert(out.format, in.format) &&
           Convert(out.dimension, in.dimension) &&
           Convert(out.aspect, in.aspect) &&
           Convert(out.baseMipLevel, in.baseMipLevel) &&
           Convert(out.mipLevelCount, in.mipLevelCount) &&
           Convert(out.baseArrayLayer, in.baseArrayLayer) &&
           Convert(out.arrayLayerCount, in.arrayLayerCount) &&
           Convert(out.label, in.label);
  }

  [[nodiscard]] bool Convert(wgpu::VertexAttribute &out,
                             const GPUVertexAttribute &in) {
    return Convert(out.format, in.format) && Convert(out.offset, in.offset) &&
           Convert(out.shaderLocation, in.shaderLocation);
  }

  [[nodiscard]] bool Convert(wgpu::VertexBufferLayout &out,
                             const GPUVertexBufferLayout &in) {
    out = {};
    /*
     TODO:
     -    if (in.stepMode == wgpu::VertexStepMode::VertexBufferNotUsed) {
     -      return Convert(out.stepMode, in.stepMode);
     -    }
     */
    return Convert(out.attributes, out.attributeCount, in.attributes) &&
           Convert(out.arrayStride, in.arrayStride) &&
           Convert(out.stepMode, in.stepMode);
  }

  [[nodiscard]] bool Convert(wgpu::VertexState &out, const GPUVertexState &in) {
    out = {};
    // Replace nulls in the entryPoint name with another character that's
    // disallowed in WGSL identifiers. This is so that using "main\0" doesn't
    // match an entryPoint named "main".
    out.entryPoint = in.entryPoint
                         ? ConvertStringReplacingNull(in.entryPoint.value())
                         : nullptr;
    return Convert(out.module, in.module) &&
           Convert(out.buffers, out.bufferCount, in.buffers) &&
           Convert(out.constants, out.constantCount, in.constants);
  }

  [[nodiscard]] bool Convert(wgpu::CommandBufferDescriptor &out,
                             const GPUCommandBufferDescriptor &in) {
    return Convert(out.label, in.label);
  }

  [[nodiscard]] bool Convert(wgpu::CommandEncoderDescriptor &out,
                             const GPUCommandEncoderDescriptor &in) {
    return Convert(out.label, in.label);
  }

  [[nodiscard]] bool Convert(wgpu::QueueDescriptor &out,
                             const GPUQueueDescriptor &in) {
    return Convert(out.label, in.label);
  }

  [[nodiscard]] bool Convert(wgpu::RenderBundleDescriptor &out,
                             const GPURenderBundleDescriptor &in) {
    return Convert(out.label, in.label);
  }

  [[nodiscard]] bool Convert(wgpu::BindGroupEntry &out,
                             const GPUBindGroupEntry &in) {
    out = {};
    if (!Convert(out.binding, in.binding)) {
      return false;
    }

    if (in.sampler != nullptr) {
      return Convert(out.sampler, in.sampler);
    }
    if (in.textureView != nullptr) {
      return Convert(out.textureView, in.textureView);
    }
    if (in.buffer != nullptr) {
      auto buffer = in.buffer->buffer;
      out.size = wgpu::kWholeSize;
      if (!buffer || !Convert(out.offset, in.buffer->offset) ||
          !Convert(out.size, in.buffer->size)) {
        return false;
      }
      out.buffer = buffer->get();
      return true;
    }
    // Not external textures at the moment
    return false;
  }

private:
  char *ConvertStringReplacingNull(std::string_view in) {
    char *out = Allocate<char>(in.size() + 1);
    out[in.size()] = '\0';

    for (size_t i = 0; i < in.size(); i++) {
      if (in[i] == '\0') {
        out[i] = '#';
      } else {
        out[i] = in[i];
      }
    }

    return out;
  }

  template <typename T> T *Allocate(size_t n = 1) {
    auto *ptr = new T[n]{};
    free_.emplace_back([ptr] { delete[] ptr; });
    return ptr;
  }

  std::vector<std::function<void()>> free_;
};

} // namespace rnwgpu
