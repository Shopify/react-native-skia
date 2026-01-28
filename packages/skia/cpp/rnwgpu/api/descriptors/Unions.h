#pragma once

#include <string>

#include "jsi2/EnumMapper.h"
#include "rnwgpu/api/External.h"
#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {
namespace EnumMapper {

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::AddressMode *outEnum) {
  if (inUnion == "clamp-to-edge") {
    *outEnum = wgpu::AddressMode::ClampToEdge;
  } else if (inUnion == "repeat") {
    *outEnum = wgpu::AddressMode::Repeat;
  } else if (inUnion == "mirror-repeat") {
    *outEnum = wgpu::AddressMode::MirrorRepeat;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::AddressMode inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::AddressMode::ClampToEdge:
    *outUnion = "clamp-to-edge";
    break;
  case wgpu::AddressMode::Repeat:
    *outUnion = "repeat";
    break;
  case wgpu::AddressMode::MirrorRepeat:
    *outUnion = "mirror-repeat";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::BlendFactor *outEnum) {
  if (inUnion == "zero") {
    *outEnum = wgpu::BlendFactor::Zero;
  } else if (inUnion == "one") {
    *outEnum = wgpu::BlendFactor::One;
  } else if (inUnion == "src") {
    *outEnum = wgpu::BlendFactor::Src;
  } else if (inUnion == "one-minus-src") {
    *outEnum = wgpu::BlendFactor::OneMinusSrc;
  } else if (inUnion == "src-alpha") {
    *outEnum = wgpu::BlendFactor::SrcAlpha;
  } else if (inUnion == "one-minus-src-alpha") {
    *outEnum = wgpu::BlendFactor::OneMinusSrcAlpha;
  } else if (inUnion == "dst") {
    *outEnum = wgpu::BlendFactor::Dst;
  } else if (inUnion == "one-minus-dst") {
    *outEnum = wgpu::BlendFactor::OneMinusDst;
  } else if (inUnion == "dst-alpha") {
    *outEnum = wgpu::BlendFactor::DstAlpha;
  } else if (inUnion == "one-minus-dst-alpha") {
    *outEnum = wgpu::BlendFactor::OneMinusDstAlpha;
  } else if (inUnion == "src-alpha-saturated") {
    *outEnum = wgpu::BlendFactor::SrcAlphaSaturated;
  } else if (inUnion == "constant") {
    *outEnum = wgpu::BlendFactor::Constant;
  } else if (inUnion == "one-minus-constant") {
    *outEnum = wgpu::BlendFactor::OneMinusConstant;
  } else if (inUnion == "src1") {
    *outEnum = wgpu::BlendFactor::Src1;
  } else if (inUnion == "one-minus-src1") {
    *outEnum = wgpu::BlendFactor::OneMinusSrc1;
  } else if (inUnion == "src1-alpha") {
    *outEnum = wgpu::BlendFactor::Src1Alpha;
  } else if (inUnion == "one-minus-src1-alpha") {
    *outEnum = wgpu::BlendFactor::OneMinusSrc1Alpha;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::BlendFactor inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::BlendFactor::Zero:
    *outUnion = "zero";
    break;
  case wgpu::BlendFactor::One:
    *outUnion = "one";
    break;
  case wgpu::BlendFactor::Src:
    *outUnion = "src";
    break;
  case wgpu::BlendFactor::OneMinusSrc:
    *outUnion = "one-minus-src";
    break;
  case wgpu::BlendFactor::SrcAlpha:
    *outUnion = "src-alpha";
    break;
  case wgpu::BlendFactor::OneMinusSrcAlpha:
    *outUnion = "one-minus-src-alpha";
    break;
  case wgpu::BlendFactor::Dst:
    *outUnion = "dst";
    break;
  case wgpu::BlendFactor::OneMinusDst:
    *outUnion = "one-minus-dst";
    break;
  case wgpu::BlendFactor::DstAlpha:
    *outUnion = "dst-alpha";
    break;
  case wgpu::BlendFactor::OneMinusDstAlpha:
    *outUnion = "one-minus-dst-alpha";
    break;
  case wgpu::BlendFactor::SrcAlphaSaturated:
    *outUnion = "src-alpha-saturated";
    break;
  case wgpu::BlendFactor::Constant:
    *outUnion = "constant";
    break;
  case wgpu::BlendFactor::OneMinusConstant:
    *outUnion = "one-minus-constant";
    break;
  case wgpu::BlendFactor::Src1:
    *outUnion = "src1";
    break;
  case wgpu::BlendFactor::OneMinusSrc1:
    *outUnion = "one-minus-src1";
    break;
  case wgpu::BlendFactor::Src1Alpha:
    *outUnion = "src1-alpha";
    break;
  case wgpu::BlendFactor::OneMinusSrc1Alpha:
    *outUnion = "one-minus-src1-alpha";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::BlendOperation *outEnum) {
  if (inUnion == "add") {
    *outEnum = wgpu::BlendOperation::Add;
  } else if (inUnion == "subtract") {
    *outEnum = wgpu::BlendOperation::Subtract;
  } else if (inUnion == "reverse-subtract") {
    *outEnum = wgpu::BlendOperation::ReverseSubtract;
  } else if (inUnion == "min") {
    *outEnum = wgpu::BlendOperation::Min;
  } else if (inUnion == "max") {
    *outEnum = wgpu::BlendOperation::Max;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::BlendOperation inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::BlendOperation::Add:
    *outUnion = "add";
    break;
  case wgpu::BlendOperation::Subtract:
    *outUnion = "subtract";
    break;
  case wgpu::BlendOperation::ReverseSubtract:
    *outUnion = "reverse-subtract";
    break;
  case wgpu::BlendOperation::Min:
    *outUnion = "min";
    break;
  case wgpu::BlendOperation::Max:
    *outUnion = "max";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::BufferBindingType *outEnum) {
  if (inUnion == "uniform") {
    *outEnum = wgpu::BufferBindingType::Uniform;
  } else if (inUnion == "storage") {
    *outEnum = wgpu::BufferBindingType::Storage;
  } else if (inUnion == "read-only-storage") {
    *outEnum = wgpu::BufferBindingType::ReadOnlyStorage;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::BufferBindingType inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::BufferBindingType::Uniform:
    *outUnion = "uniform";
    break;
  case wgpu::BufferBindingType::Storage:
    *outUnion = "storage";
    break;
  case wgpu::BufferBindingType::ReadOnlyStorage:
    *outUnion = "read-only-storage";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::BufferMapState *outEnum) {
  if (inUnion == "unmapped") {
    *outEnum = wgpu::BufferMapState::Unmapped;
  } else if (inUnion == "pending") {
    *outEnum = wgpu::BufferMapState::Pending;
  } else if (inUnion == "mapped") {
    *outEnum = wgpu::BufferMapState::Mapped;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::BufferMapState inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::BufferMapState::Unmapped:
    *outUnion = "unmapped";
    break;
  case wgpu::BufferMapState::Pending:
    *outUnion = "pending";
    break;
  case wgpu::BufferMapState::Mapped:
    *outUnion = "mapped";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::CompareFunction *outEnum) {
  if (inUnion == "never") {
    *outEnum = wgpu::CompareFunction::Never;
  } else if (inUnion == "less") {
    *outEnum = wgpu::CompareFunction::Less;
  } else if (inUnion == "equal") {
    *outEnum = wgpu::CompareFunction::Equal;
  } else if (inUnion == "less-equal") {
    *outEnum = wgpu::CompareFunction::LessEqual;
  } else if (inUnion == "greater") {
    *outEnum = wgpu::CompareFunction::Greater;
  } else if (inUnion == "not-equal") {
    *outEnum = wgpu::CompareFunction::NotEqual;
  } else if (inUnion == "greater-equal") {
    *outEnum = wgpu::CompareFunction::GreaterEqual;
  } else if (inUnion == "always") {
    *outEnum = wgpu::CompareFunction::Always;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::CompareFunction inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::CompareFunction::Never:
    *outUnion = "never";
    break;
  case wgpu::CompareFunction::Less:
    *outUnion = "less";
    break;
  case wgpu::CompareFunction::Equal:
    *outUnion = "equal";
    break;
  case wgpu::CompareFunction::LessEqual:
    *outUnion = "less-equal";
    break;
  case wgpu::CompareFunction::Greater:
    *outUnion = "greater";
    break;
  case wgpu::CompareFunction::NotEqual:
    *outUnion = "not-equal";
    break;
  case wgpu::CompareFunction::GreaterEqual:
    *outUnion = "greater-equal";
    break;
  case wgpu::CompareFunction::Always:
    *outUnion = "always";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::CompilationMessageType *outEnum) {
  if (inUnion == "error") {
    *outEnum = wgpu::CompilationMessageType::Error;
  } else if (inUnion == "warning") {
    *outEnum = wgpu::CompilationMessageType::Warning;
  } else if (inUnion == "info") {
    *outEnum = wgpu::CompilationMessageType::Info;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::CompilationMessageType inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::CompilationMessageType::Error:
    *outUnion = "error";
    break;
  case wgpu::CompilationMessageType::Warning:
    *outUnion = "warning";
    break;
  case wgpu::CompilationMessageType::Info:
    *outUnion = "info";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::CullMode *outEnum) {
  if (inUnion == "none") {
    *outEnum = wgpu::CullMode::None;
  } else if (inUnion == "front") {
    *outEnum = wgpu::CullMode::Front;
  } else if (inUnion == "back") {
    *outEnum = wgpu::CullMode::Back;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::CullMode inEnum, std::string *outUnion) {
  switch (inEnum) {
  case wgpu::CullMode::None:
    *outUnion = "none";
    break;
  case wgpu::CullMode::Front:
    *outUnion = "front";
    break;
  case wgpu::CullMode::Back:
    *outUnion = "back";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::DeviceLostReason *outEnum) {
  if (inUnion == "unknown") {
    *outEnum = wgpu::DeviceLostReason::Unknown;
  } else if (inUnion == "destroyed") {
    *outEnum = wgpu::DeviceLostReason::Destroyed;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::DeviceLostReason inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::DeviceLostReason::Unknown:
    *outUnion = "unknown";
    break;
  case wgpu::DeviceLostReason::Destroyed:
    *outUnion = "destroyed";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::ErrorFilter *outEnum) {
  if (inUnion == "validation") {
    *outEnum = wgpu::ErrorFilter::Validation;
  } else if (inUnion == "out-of-memory") {
    *outEnum = wgpu::ErrorFilter::OutOfMemory;
  } else if (inUnion == "internal") {
    *outEnum = wgpu::ErrorFilter::Internal;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::ErrorFilter inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::ErrorFilter::Validation:
    *outUnion = "validation";
    break;
  case wgpu::ErrorFilter::OutOfMemory:
    *outUnion = "out-of-memory";
    break;
  case wgpu::ErrorFilter::Internal:
    *outUnion = "internal";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::FeatureName *outEnum) {
  if (inUnion == "depth-clip-control") {
    *outEnum = wgpu::FeatureName::DepthClipControl;
  } else if (inUnion == "depth32float-stencil8") {
    *outEnum = wgpu::FeatureName::Depth32FloatStencil8;
  } else if (inUnion == "texture-compression-bc") {
    *outEnum = wgpu::FeatureName::TextureCompressionBC;
  } else if (inUnion == "texture-compression-etc2") {
    *outEnum = wgpu::FeatureName::TextureCompressionETC2;
  } else if (inUnion == "texture-compression-astc") {
    *outEnum = wgpu::FeatureName::TextureCompressionASTC;
  } else if (inUnion == "timestamp-query") {
    *outEnum = wgpu::FeatureName::TimestampQuery;
  } else if (inUnion == "indirect-first-instance") {
    *outEnum = wgpu::FeatureName::IndirectFirstInstance;
  } else if (inUnion == "shader-f16") {
    *outEnum = wgpu::FeatureName::ShaderF16;
  } else if (inUnion == "rg11b10ufloat-renderable") {
    *outEnum = wgpu::FeatureName::RG11B10UfloatRenderable;
  } else if (inUnion == "bgra8unorm-storage") {
    *outEnum = wgpu::FeatureName::BGRA8UnormStorage;
  } else if (inUnion == "float32-filterable") {
    *outEnum = wgpu::FeatureName::Float32Filterable;
  } else if (inUnion == "subgroups") {
    *outEnum = wgpu::FeatureName::Subgroups;
  } else if (inUnion == "dawn-internal-usages") {
    *outEnum = wgpu::FeatureName::DawnInternalUsages;
  } else if (inUnion == "dawn-multi-planar-formats") {
    *outEnum = wgpu::FeatureName::DawnMultiPlanarFormats;
  } else if (inUnion == "dawn-native") {
    *outEnum = wgpu::FeatureName::DawnNative;
  } else if (inUnion == "chromium-experimental-timestamp-query-inside-passes") {
    *outEnum =
        wgpu::FeatureName::ChromiumExperimentalTimestampQueryInsidePasses;
  } else if (inUnion == "implicit-device-synchronization") {
    *outEnum = wgpu::FeatureName::ImplicitDeviceSynchronization;
  } else if (inUnion == "transient-attachments") {
    *outEnum = wgpu::FeatureName::TransientAttachments;
  } else if (inUnion == "msaa-render-to-single-sampled") {
    *outEnum = wgpu::FeatureName::MSAARenderToSingleSampled;
  } else if (inUnion == "dual-source-blending") {
    *outEnum = wgpu::FeatureName::DualSourceBlending;
  } else if (inUnion == "d3d11-multithread-protected") {
    *outEnum = wgpu::FeatureName::D3D11MultithreadProtected;
  } else if (inUnion == "angle-texture-sharing") {
    *outEnum = wgpu::FeatureName::ANGLETextureSharing;
  } else if (inUnion == "chromium-experimental-subgroups-matrix") {
    *outEnum = wgpu::FeatureName::ChromiumExperimentalSubgroupMatrix;
  } else if (inUnion == "pixel-local-storage-coherent") {
    *outEnum = wgpu::FeatureName::PixelLocalStorageCoherent;
  } else if (inUnion == "pixel-local-storage-non-coherent") {
    *outEnum = wgpu::FeatureName::PixelLocalStorageNonCoherent;
  } else if (inUnion == "unorm16-texture-formats") {
    *outEnum = wgpu::FeatureName::Unorm16TextureFormats;
  } else if (inUnion == "snorm16-texture-formats") {
    *outEnum = wgpu::FeatureName::Snorm16TextureFormats;
  } else if (inUnion == "multi-planar-format-extended-usages") {
    *outEnum = wgpu::FeatureName::MultiPlanarFormatExtendedUsages;
  } else if (inUnion == "multi-planar-format-p010") {
    *outEnum = wgpu::FeatureName::MultiPlanarFormatP010;
  } else if (inUnion == "host-mapped-pointer") {
    *outEnum = wgpu::FeatureName::HostMappedPointer;
  } else if (inUnion == "multi-planar-render-targets") {
    *outEnum = wgpu::FeatureName::MultiPlanarRenderTargets;
  } else if (inUnion == "multi-planar-format-nv12a") {
    *outEnum = wgpu::FeatureName::MultiPlanarFormatNv12a;
  } else if (inUnion == "framebuffer-fetch") {
    *outEnum = wgpu::FeatureName::FramebufferFetch;
  } else if (inUnion == "buffer-map-extended-usages") {
    *outEnum = wgpu::FeatureName::BufferMapExtendedUsages;
  } else if (inUnion == "adapter-properties-memory-heaps") {
    *outEnum = wgpu::FeatureName::AdapterPropertiesMemoryHeaps;
  } else if (inUnion == "adapter-properties-d3d") {
    *outEnum = wgpu::FeatureName::AdapterPropertiesD3D;
  } else if (inUnion == "adapter-properties-vk") {
    *outEnum = wgpu::FeatureName::AdapterPropertiesVk;
  } else if (inUnion == "r8unorm-storage") {
    *outEnum = wgpu::FeatureName::R8UnormStorage;
  } else if (inUnion == "format-capabilities") {
    *outEnum = wgpu::FeatureName::DawnFormatCapabilities;
  } else if (inUnion == "norm16-texture-formats") {
    *outEnum = wgpu::FeatureName::Norm16TextureFormats;
  } else if (inUnion == "multi-planar-format-nv16") {
    *outEnum = wgpu::FeatureName::MultiPlanarFormatNv16;
  } else if (inUnion == "multi-planar-format-nv24") {
    *outEnum = wgpu::FeatureName::MultiPlanarFormatNv24;
  } else if (inUnion == "multi-planar-format-p210") {
    *outEnum = wgpu::FeatureName::MultiPlanarFormatP210;
  } else if (inUnion == "multi-planar-format-p410") {
    *outEnum = wgpu::FeatureName::MultiPlanarFormatP410;
  } else if (inUnion == "shared-texture-memory-vk-dedicated-allocation") {
    *outEnum = wgpu::FeatureName::SharedTextureMemoryVkDedicatedAllocation;
  } else if (inUnion == "shared-texture-memory-ahardware-buffer") {
    *outEnum = wgpu::FeatureName::SharedTextureMemoryAHardwareBuffer;
  } else if (inUnion == "shared-texture-memory-dma-buf") {
    *outEnum = wgpu::FeatureName::SharedTextureMemoryDmaBuf;
  } else if (inUnion == "shared-texture-memory-opaque-fd") {
    *outEnum = wgpu::FeatureName::SharedTextureMemoryOpaqueFD;
  } else if (inUnion == "shared-texture-memory-zircon-handle") {
    *outEnum = wgpu::FeatureName::SharedTextureMemoryZirconHandle;
  } else if (inUnion == "shared-texture-memory-dxgi-shared-handle") {
    *outEnum = wgpu::FeatureName::SharedTextureMemoryDXGISharedHandle;
  } else if (inUnion == "shared-texture-memory-d3d11-texture2d") {
    *outEnum = wgpu::FeatureName::SharedTextureMemoryD3D11Texture2D;
  } else if (inUnion == "shared-texture-memory-iosurface") {
    *outEnum = wgpu::FeatureName::SharedTextureMemoryIOSurface;
  } else if (inUnion == "shared-texture-memory-egl-image") {
    *outEnum = wgpu::FeatureName::SharedTextureMemoryEGLImage;
  } else if (inUnion == "shared-fence-vk-semaphore-opaque-fd") {
    *outEnum = wgpu::FeatureName::SharedFenceVkSemaphoreOpaqueFD;
  } else if (inUnion == "shared-fence-vk-semaphore-zircon-handle") {
    *outEnum = wgpu::FeatureName::SharedFenceVkSemaphoreZirconHandle;
  } else if (inUnion == "shared-fence-dxgi-shared-handle") {
    *outEnum = wgpu::FeatureName::SharedFenceDXGISharedHandle;
  } else if (inUnion == "shared-fence-mtl-shared-event") {
    *outEnum = wgpu::FeatureName::SharedFenceMTLSharedEvent;
  } else if (inUnion == "shared-buffer-memory-d3d12-resource") {
    *outEnum = wgpu::FeatureName::SharedBufferMemoryD3D12Resource;
  } else if (inUnion == "static-samplers") {
    *outEnum = wgpu::FeatureName::StaticSamplers;
  } else if (inUnion == "ycbcr-vulkan-samplers") {
    *outEnum = wgpu::FeatureName::YCbCrVulkanSamplers;
  } else if (inUnion == "shader-module-compilation-options") {
    *outEnum = wgpu::FeatureName::ShaderModuleCompilationOptions;
  } else if (inUnion == "dawn-load-resolve-texture") {
    *outEnum = wgpu::FeatureName::DawnLoadResolveTexture;
  } else if (inUnion == "clip-distances") {
    *outEnum = wgpu::FeatureName::ClipDistances;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::FeatureName inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::FeatureName::DepthClipControl:
    *outUnion = "depth-clip-control";
    break;
  case wgpu::FeatureName::Depth32FloatStencil8:
    *outUnion = "depth32float-stencil8";
    break;
  case wgpu::FeatureName::TextureCompressionBC:
    *outUnion = "texture-compression-bc";
    break;
  case wgpu::FeatureName::TextureCompressionETC2:
    *outUnion = "texture-compression-etc2";
    break;
  case wgpu::FeatureName::TextureCompressionASTC:
    *outUnion = "texture-compression-astc";
    break;
  case wgpu::FeatureName::TimestampQuery:
    *outUnion = "timestamp-query";
    break;
  case wgpu::FeatureName::IndirectFirstInstance:
    *outUnion = "indirect-first-instance";
    break;
  case wgpu::FeatureName::ShaderF16:
    *outUnion = "shader-f16";
    break;
  case wgpu::FeatureName::RG11B10UfloatRenderable:
    *outUnion = "rg11b10ufloat-renderable";
    break;
  case wgpu::FeatureName::BGRA8UnormStorage:
    *outUnion = "bgra8unorm-storage";
    break;
  case wgpu::FeatureName::Float32Filterable:
    *outUnion = "float32-filterable";
    break;
  case wgpu::FeatureName::Subgroups:
    *outUnion = "subgroups";
    break;
  case wgpu::FeatureName::DawnInternalUsages:
    *outUnion = "dawn-internal-usages";
    break;
  case wgpu::FeatureName::DawnMultiPlanarFormats:
    *outUnion = "dawn-multi-planar-formats";
    break;
  case wgpu::FeatureName::DawnNative:
    *outUnion = "dawn-native";
    break;
  case wgpu::FeatureName::DawnFormatCapabilities:
    *outUnion = "format-capabilities";
    break;
  case wgpu::FeatureName::ChromiumExperimentalTimestampQueryInsidePasses:
    *outUnion = "chromium-experimental-timestamp-query-inside-passes";
    break;
  case wgpu::FeatureName::ImplicitDeviceSynchronization:
    *outUnion = "implicit-device-synchronization";
    break;
    //  case wgpu::FeatureName::SurfaceCapabilities:
    //    *outUnion = "surface-capabilities";
    //    break;
  case wgpu::FeatureName::TransientAttachments:
    *outUnion = "transient-attachments";
    break;
  case wgpu::FeatureName::MSAARenderToSingleSampled:
    *outUnion = "msaa-render-to-single-sampled";
    break;
  case wgpu::FeatureName::DualSourceBlending:
    *outUnion = "dual-source-blending";
    break;
  case wgpu::FeatureName::D3D11MultithreadProtected:
    *outUnion = "d3d11-multithread-protected";
    break;
  case wgpu::FeatureName::ANGLETextureSharing:
    *outUnion = "angle-texture-sharing";
    break;
  case wgpu::FeatureName::ChromiumExperimentalSubgroupMatrix:
    *outUnion = "chromium-experimental-subgroups-matrix";
    break;
  case wgpu::FeatureName::PixelLocalStorageCoherent:
    *outUnion = "pixel-local-storage-coherent";
    break;
  case wgpu::FeatureName::PixelLocalStorageNonCoherent:
    *outUnion = "pixel-local-storage-non-coherent";
    break;
  case wgpu::FeatureName::Unorm16TextureFormats:
    *outUnion = "unorm16-texture-formats";
    break;
  case wgpu::FeatureName::Snorm16TextureFormats:
    *outUnion = "snorm16-texture-formats";
    break;
  case wgpu::FeatureName::MultiPlanarFormatExtendedUsages:
    *outUnion = "multi-planar-format-extended-usages";
    break;
  case wgpu::FeatureName::MultiPlanarFormatP010:
    *outUnion = "multi-planar-format-p010";
    break;
  case wgpu::FeatureName::HostMappedPointer:
    *outUnion = "host-mapped-pointer";
    break;
  case wgpu::FeatureName::MultiPlanarRenderTargets:
    *outUnion = "multi-planar-render-targets";
    break;
  case wgpu::FeatureName::MultiPlanarFormatNv12a:
    *outUnion = "multi-planar-format-nv12a";
    break;
  case wgpu::FeatureName::FramebufferFetch:
    *outUnion = "framebuffer-fetch";
    break;
  case wgpu::FeatureName::BufferMapExtendedUsages:
    *outUnion = "buffer-map-extended-usages";
    break;
  case wgpu::FeatureName::AdapterPropertiesMemoryHeaps:
    *outUnion = "adapter-properties-memory-heaps";
    break;
  case wgpu::FeatureName::AdapterPropertiesD3D:
    *outUnion = "adapter-properties-d3d";
    break;
  case wgpu::FeatureName::AdapterPropertiesVk:
    *outUnion = "adapter-properties-vk";
    break;
  case wgpu::FeatureName::R8UnormStorage:
    *outUnion = "r8unorm-storage";
    break;
  case wgpu::FeatureName::Norm16TextureFormats:
    *outUnion = "norm16-texture-formats";
    break;
  case wgpu::FeatureName::MultiPlanarFormatNv16:
    *outUnion = "multi-planar-format-nv16";
    break;
  case wgpu::FeatureName::MultiPlanarFormatNv24:
    *outUnion = "multi-planar-format-nv24";
    break;
  case wgpu::FeatureName::MultiPlanarFormatP210:
    *outUnion = "multi-planar-format-p210";
    break;
  case wgpu::FeatureName::MultiPlanarFormatP410:
    *outUnion = "multi-planar-format-p410";
    break;
  case wgpu::FeatureName::SharedTextureMemoryVkDedicatedAllocation:
    *outUnion = "shared-texture-memory-vk-dedicated-allocation";
    break;
  case wgpu::FeatureName::SharedTextureMemoryAHardwareBuffer:
    *outUnion = "shared-texture-memory-ahardware-buffer";
    break;
  case wgpu::FeatureName::SharedTextureMemoryDmaBuf:
    *outUnion = "shared-texture-memory-dma-buf";
    break;
  case wgpu::FeatureName::SharedTextureMemoryOpaqueFD:
    *outUnion = "shared-texture-memory-opaque-fd";
    break;
  case wgpu::FeatureName::SharedTextureMemoryZirconHandle:
    *outUnion = "shared-texture-memory-zircon-handle";
    break;
  case wgpu::FeatureName::SharedTextureMemoryDXGISharedHandle:
    *outUnion = "shared-texture-memory-dxgi-shared-handle";
    break;
  case wgpu::FeatureName::SharedTextureMemoryD3D11Texture2D:
    *outUnion = "shared-texture-memory-d3d11-texture2d";
    break;
  case wgpu::FeatureName::SharedTextureMemoryIOSurface:
    *outUnion = "shared-texture-memory-iosurface";
    break;
  case wgpu::FeatureName::SharedTextureMemoryEGLImage:
    *outUnion = "shared-texture-memory-egl-image";
    break;
  case wgpu::FeatureName::SharedFenceVkSemaphoreOpaqueFD:
    *outUnion = "shared-fence-vk-semaphore-opaque-fd";
    break;
  case wgpu::FeatureName::SharedFenceVkSemaphoreZirconHandle:
    *outUnion = "shared-fence-vk-semaphore-zircon-handle";
    break;
  case wgpu::FeatureName::SharedFenceDXGISharedHandle:
    *outUnion = "shared-fence-dxgi-shared-handle";
    break;
  case wgpu::FeatureName::SharedFenceMTLSharedEvent:
    *outUnion = "shared-fence-mtl-shared-event";
    break;
  case wgpu::FeatureName::SharedBufferMemoryD3D12Resource:
    *outUnion = "shared-buffer-memory-d3d12-resource";
    break;
  case wgpu::FeatureName::StaticSamplers:
    *outUnion = "static-samplers";
    break;
  case wgpu::FeatureName::YCbCrVulkanSamplers:
    *outUnion = "ycbcr-vulkan-samplers";
    break;
  case wgpu::FeatureName::ShaderModuleCompilationOptions:
    *outUnion = "shader-module-compilation-options";
    break;
  case wgpu::FeatureName::DawnLoadResolveTexture:
    *outUnion = "dawn-load-resolve-texture";
    break;
  case wgpu::FeatureName::ClipDistances:
    *outUnion = "clip-distances";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::FilterMode *outEnum) {
  if (inUnion == "nearest") {
    *outEnum = wgpu::FilterMode::Nearest;
  } else if (inUnion == "linear") {
    *outEnum = wgpu::FilterMode::Linear;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::FilterMode inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::FilterMode::Nearest:
    *outUnion = "nearest";
    break;
  case wgpu::FilterMode::Linear:
    *outUnion = "linear";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::FrontFace *outEnum) {
  if (inUnion == "ccw") {
    *outEnum = wgpu::FrontFace::CCW;
  } else if (inUnion == "cw") {
    *outEnum = wgpu::FrontFace::CW;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::FrontFace inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::FrontFace::CCW:
    *outUnion = "ccw";
    break;
  case wgpu::FrontFace::CW:
    *outUnion = "cw";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::IndexFormat *outEnum) {
  if (inUnion == "uint16") {
    *outEnum = wgpu::IndexFormat::Uint16;
  } else if (inUnion == "uint32") {
    *outEnum = wgpu::IndexFormat::Uint32;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::IndexFormat inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::IndexFormat::Uint16:
    *outUnion = "uint16";
    break;
  case wgpu::IndexFormat::Uint32:
    *outUnion = "uint32";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::LoadOp *outEnum) {
  if (inUnion == "load") {
    *outEnum = wgpu::LoadOp::Load;
  } else if (inUnion == "clear") {
    *outEnum = wgpu::LoadOp::Clear;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::LoadOp inEnum, std::string *outUnion) {
  switch (inEnum) {
  case wgpu::LoadOp::Load:
    *outUnion = "load";
    break;
  case wgpu::LoadOp::Clear:
    *outUnion = "clear";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::MipmapFilterMode *outEnum) {
  if (inUnion == "nearest") {
    *outEnum = wgpu::MipmapFilterMode::Nearest;
  } else if (inUnion == "linear") {
    *outEnum = wgpu::MipmapFilterMode::Linear;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::MipmapFilterMode inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::MipmapFilterMode::Nearest:
    *outUnion = "nearest";
    break;
  case wgpu::MipmapFilterMode::Linear:
    *outUnion = "linear";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::PowerPreference *outEnum) {
  if (inUnion == "low-power") {
    *outEnum = wgpu::PowerPreference::LowPower;
  } else if (inUnion == "high-performance") {
    *outEnum = wgpu::PowerPreference::HighPerformance;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::PowerPreference inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::PowerPreference::LowPower:
    *outUnion = "low-power";
    break;
  case wgpu::PowerPreference::HighPerformance:
    *outUnion = "high-performance";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::PrimitiveTopology *outEnum) {
  if (inUnion == "point-list") {
    *outEnum = wgpu::PrimitiveTopology::PointList;
  } else if (inUnion == "line-list") {
    *outEnum = wgpu::PrimitiveTopology::LineList;
  } else if (inUnion == "line-strip") {
    *outEnum = wgpu::PrimitiveTopology::LineStrip;
  } else if (inUnion == "triangle-list") {
    *outEnum = wgpu::PrimitiveTopology::TriangleList;
  } else if (inUnion == "triangle-strip") {
    *outEnum = wgpu::PrimitiveTopology::TriangleStrip;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::PrimitiveTopology inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::PrimitiveTopology::PointList:
    *outUnion = "point-list";
    break;
  case wgpu::PrimitiveTopology::LineList:
    *outUnion = "line-list";
    break;
  case wgpu::PrimitiveTopology::LineStrip:
    *outUnion = "line-strip";
    break;
  case wgpu::PrimitiveTopology::TriangleList:
    *outUnion = "triangle-list";
    break;
  case wgpu::PrimitiveTopology::TriangleStrip:
    *outUnion = "triangle-strip";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::QueryType *outEnum) {
  if (inUnion == "occlusion") {
    *outEnum = wgpu::QueryType::Occlusion;
  } else if (inUnion == "timestamp") {
    *outEnum = wgpu::QueryType::Timestamp;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::QueryType inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::QueryType::Occlusion:
    *outUnion = "occlusion";
    break;
  case wgpu::QueryType::Timestamp:
    *outUnion = "timestamp";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::SamplerBindingType *outEnum) {
  if (inUnion == "filtering") {
    *outEnum = wgpu::SamplerBindingType::Filtering;
  } else if (inUnion == "non-filtering") {
    *outEnum = wgpu::SamplerBindingType::NonFiltering;
  } else if (inUnion == "comparison") {
    *outEnum = wgpu::SamplerBindingType::Comparison;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::SamplerBindingType inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::SamplerBindingType::Filtering:
    *outUnion = "filtering";
    break;
  case wgpu::SamplerBindingType::NonFiltering:
    *outUnion = "non-filtering";
    break;
  case wgpu::SamplerBindingType::Comparison:
    *outUnion = "comparison";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::StencilOperation *outEnum) {
  if (inUnion == "zero") {
    *outEnum = wgpu::StencilOperation::Zero;
  } else if (inUnion == "keep") {
    *outEnum = wgpu::StencilOperation::Keep;
  } else if (inUnion == "replace") {
    *outEnum = wgpu::StencilOperation::Replace;
  } else if (inUnion == "invert") {
    *outEnum = wgpu::StencilOperation::Invert;
  } else if (inUnion == "increment-clamp") {
    *outEnum = wgpu::StencilOperation::IncrementClamp;
  } else if (inUnion == "decrement-clamp") {
    *outEnum = wgpu::StencilOperation::DecrementClamp;
  } else if (inUnion == "increment-wrap") {
    *outEnum = wgpu::StencilOperation::IncrementWrap;
  } else if (inUnion == "decrement-wrap") {
    *outEnum = wgpu::StencilOperation::DecrementWrap;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::StencilOperation inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::StencilOperation::Zero:
    *outUnion = "zero";
    break;
  case wgpu::StencilOperation::Keep:
    *outUnion = "keep";
    break;
  case wgpu::StencilOperation::Replace:
    *outUnion = "replace";
    break;
  case wgpu::StencilOperation::Invert:
    *outUnion = "invert";
    break;
  case wgpu::StencilOperation::IncrementClamp:
    *outUnion = "increment-clamp";
    break;
  case wgpu::StencilOperation::DecrementClamp:
    *outUnion = "decrement-clamp";
    break;
  case wgpu::StencilOperation::IncrementWrap:
    *outUnion = "increment-wrap";
    break;
  case wgpu::StencilOperation::DecrementWrap:
    *outUnion = "decrement-wrap";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::StorageTextureAccess *outEnum) {
  if (inUnion == "write-only") {
    *outEnum = wgpu::StorageTextureAccess::WriteOnly;
  } else if (inUnion == "read-only") {
    *outEnum = wgpu::StorageTextureAccess::ReadOnly;
  } else if (inUnion == "read-write") {
    *outEnum = wgpu::StorageTextureAccess::ReadWrite;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::StorageTextureAccess inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::StorageTextureAccess::WriteOnly:
    *outUnion = "write-only";
    break;
  case wgpu::StorageTextureAccess::ReadOnly:
    *outUnion = "read-only";
    break;
  case wgpu::StorageTextureAccess::ReadWrite:
    *outUnion = "read-write";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::StoreOp *outEnum) {
  if (inUnion == "store") {
    *outEnum = wgpu::StoreOp::Store;
  } else if (inUnion == "discard") {
    *outEnum = wgpu::StoreOp::Discard;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::StoreOp inEnum, std::string *outUnion) {
  switch (inEnum) {
  case wgpu::StoreOp::Store:
    *outUnion = "store";
    break;
  case wgpu::StoreOp::Discard:
    *outUnion = "discard";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::TextureAspect *outEnum) {
  if (inUnion == "all") {
    *outEnum = wgpu::TextureAspect::All;
  } else if (inUnion == "stencil-only") {
    *outEnum = wgpu::TextureAspect::StencilOnly;
  } else if (inUnion == "depth-only") {
    *outEnum = wgpu::TextureAspect::DepthOnly;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::TextureAspect inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::TextureAspect::All:
    *outUnion = "all";
    break;
  case wgpu::TextureAspect::StencilOnly:
    *outUnion = "stencil-only";
    break;
  case wgpu::TextureAspect::DepthOnly:
    *outUnion = "depth-only";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::TextureDimension *outEnum) {
  if (inUnion == "1d") {
    *outEnum = wgpu::TextureDimension::e1D;
  } else if (inUnion == "2d") {
    *outEnum = wgpu::TextureDimension::e2D;
  } else if (inUnion == "3d") {
    *outEnum = wgpu::TextureDimension::e3D;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::TextureDimension inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::TextureDimension::e1D:
    *outUnion = "1d";
    break;
  case wgpu::TextureDimension::e2D:
    *outUnion = "2d";
    break;
  case wgpu::TextureDimension::e3D:
    *outUnion = "3d";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::TextureFormat *outEnum) {
  if (inUnion == "depth32float-stencil8") {
    *outEnum = wgpu::TextureFormat::Depth32FloatStencil8;
  } else if (inUnion == "r8unorm") {
    *outEnum = wgpu::TextureFormat::R8Unorm;
  } else if (inUnion == "r8snorm") {
    *outEnum = wgpu::TextureFormat::R8Snorm;
  } else if (inUnion == "r8uint") {
    *outEnum = wgpu::TextureFormat::R8Uint;
  } else if (inUnion == "r8sint") {
    *outEnum = wgpu::TextureFormat::R8Sint;
  } else if (inUnion == "r16uint") {
    *outEnum = wgpu::TextureFormat::R16Uint;
  } else if (inUnion == "r16sint") {
    *outEnum = wgpu::TextureFormat::R16Sint;
  } else if (inUnion == "r16float") {
    *outEnum = wgpu::TextureFormat::R16Float;
  } else if (inUnion == "rg8unorm") {
    *outEnum = wgpu::TextureFormat::RG8Unorm;
  } else if (inUnion == "rg8snorm") {
    *outEnum = wgpu::TextureFormat::RG8Snorm;
  } else if (inUnion == "rg8uint") {
    *outEnum = wgpu::TextureFormat::RG8Uint;
  } else if (inUnion == "rg8sint") {
    *outEnum = wgpu::TextureFormat::RG8Sint;
  } else if (inUnion == "r32uint") {
    *outEnum = wgpu::TextureFormat::R32Uint;
  } else if (inUnion == "r32sint") {
    *outEnum = wgpu::TextureFormat::R32Sint;
  } else if (inUnion == "r32float") {
    *outEnum = wgpu::TextureFormat::R32Float;
  } else if (inUnion == "rg16uint") {
    *outEnum = wgpu::TextureFormat::RG16Uint;
  } else if (inUnion == "rg16sint") {
    *outEnum = wgpu::TextureFormat::RG16Sint;
  } else if (inUnion == "rg16float") {
    *outEnum = wgpu::TextureFormat::RG16Float;
  } else if (inUnion == "rgba8unorm") {
    *outEnum = wgpu::TextureFormat::RGBA8Unorm;
  } else if (inUnion == "rgba8unorm-srgb") {
    *outEnum = wgpu::TextureFormat::RGBA8UnormSrgb;
  } else if (inUnion == "rgba8snorm") {
    *outEnum = wgpu::TextureFormat::RGBA8Snorm;
  } else if (inUnion == "rgba8uint") {
    *outEnum = wgpu::TextureFormat::RGBA8Uint;
  } else if (inUnion == "rgba8sint") {
    *outEnum = wgpu::TextureFormat::RGBA8Sint;
  } else if (inUnion == "bgra8unorm") {
    *outEnum = wgpu::TextureFormat::BGRA8Unorm;
  } else if (inUnion == "bgra8unorm-srgb") {
    *outEnum = wgpu::TextureFormat::BGRA8UnormSrgb;
  } else if (inUnion == "rgb9e5ufloat") {
    *outEnum = wgpu::TextureFormat::RGB9E5Ufloat;
  } else if (inUnion == "rgb10a2uint") {
    *outEnum = wgpu::TextureFormat::RGB10A2Uint;
  } else if (inUnion == "rgb10a2unorm") {
    *outEnum = wgpu::TextureFormat::RGB10A2Unorm;
  } else if (inUnion == "rg11b10ufloat") {
    *outEnum = wgpu::TextureFormat::RG11B10Ufloat;
  } else if (inUnion == "rg32uint") {
    *outEnum = wgpu::TextureFormat::RG32Uint;
  } else if (inUnion == "rg32sint") {
    *outEnum = wgpu::TextureFormat::RG32Sint;
  } else if (inUnion == "rg32float") {
    *outEnum = wgpu::TextureFormat::RG32Float;
  } else if (inUnion == "rgba16uint") {
    *outEnum = wgpu::TextureFormat::RGBA16Uint;
  } else if (inUnion == "rgba16sint") {
    *outEnum = wgpu::TextureFormat::RGBA16Sint;
  } else if (inUnion == "rgba16float") {
    *outEnum = wgpu::TextureFormat::RGBA16Float;
  } else if (inUnion == "rgba32uint") {
    *outEnum = wgpu::TextureFormat::RGBA32Uint;
  } else if (inUnion == "rgba32sint") {
    *outEnum = wgpu::TextureFormat::RGBA32Sint;
  } else if (inUnion == "rgba32float") {
    *outEnum = wgpu::TextureFormat::RGBA32Float;
  } else if (inUnion == "stencil8") {
    *outEnum = wgpu::TextureFormat::Stencil8;
  } else if (inUnion == "depth16unorm") {
    *outEnum = wgpu::TextureFormat::Depth16Unorm;
  } else if (inUnion == "depth24plus") {
    *outEnum = wgpu::TextureFormat::Depth24Plus;
  } else if (inUnion == "depth24plus-stencil8") {
    *outEnum = wgpu::TextureFormat::Depth24PlusStencil8;
  } else if (inUnion == "depth32float") {
    *outEnum = wgpu::TextureFormat::Depth32Float;
  } else if (inUnion == "bc1-rgba-unorm") {
    *outEnum = wgpu::TextureFormat::BC1RGBAUnorm;
  } else if (inUnion == "bc1-rgba-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::BC1RGBAUnormSrgb;
  } else if (inUnion == "bc2-rgba-unorm") {
    *outEnum = wgpu::TextureFormat::BC2RGBAUnorm;
  } else if (inUnion == "bc2-rgba-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::BC2RGBAUnormSrgb;
  } else if (inUnion == "bc3-rgba-unorm") {
    *outEnum = wgpu::TextureFormat::BC3RGBAUnorm;
  } else if (inUnion == "bc3-rgba-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::BC3RGBAUnormSrgb;
  } else if (inUnion == "bc4-r-unorm") {
    *outEnum = wgpu::TextureFormat::BC4RUnorm;
  } else if (inUnion == "bc4-r-snorm") {
    *outEnum = wgpu::TextureFormat::BC4RSnorm;
  } else if (inUnion == "bc5-rg-unorm") {
    *outEnum = wgpu::TextureFormat::BC5RGUnorm;
  } else if (inUnion == "bc5-rg-snorm") {
    *outEnum = wgpu::TextureFormat::BC5RGSnorm;
  } else if (inUnion == "bc6h-rgb-ufloat") {
    *outEnum = wgpu::TextureFormat::BC6HRGBUfloat;
  } else if (inUnion == "bc6h-rgb-float") {
    *outEnum = wgpu::TextureFormat::BC6HRGBFloat;
  } else if (inUnion == "bc7-rgba-unorm") {
    *outEnum = wgpu::TextureFormat::BC7RGBAUnorm;
  } else if (inUnion == "bc7-rgba-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::BC7RGBAUnormSrgb;
  } else if (inUnion == "etc2-rgb8unorm") {
    *outEnum = wgpu::TextureFormat::ETC2RGB8Unorm;
  } else if (inUnion == "etc2-rgb8unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ETC2RGB8UnormSrgb;
  } else if (inUnion == "etc2-rgb8a1unorm") {
    *outEnum = wgpu::TextureFormat::ETC2RGB8A1Unorm;
  } else if (inUnion == "etc2-rgb8a1unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ETC2RGB8A1UnormSrgb;
  } else if (inUnion == "etc2-rgba8unorm") {
    *outEnum = wgpu::TextureFormat::ETC2RGBA8Unorm;
  } else if (inUnion == "etc2-rgba8unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ETC2RGBA8UnormSrgb;
  } else if (inUnion == "eac-r11unorm") {
    *outEnum = wgpu::TextureFormat::EACR11Unorm;
  } else if (inUnion == "eac-r11snorm") {
    *outEnum = wgpu::TextureFormat::EACR11Snorm;
  } else if (inUnion == "eac-rg11unorm") {
    *outEnum = wgpu::TextureFormat::EACRG11Unorm;
  } else if (inUnion == "eac-rg11snorm") {
    *outEnum = wgpu::TextureFormat::EACRG11Snorm;
  } else if (inUnion == "astc-4x4-unorm") {
    *outEnum = wgpu::TextureFormat::ASTC4x4Unorm;
  } else if (inUnion == "astc-4x4-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ASTC4x4UnormSrgb;
  } else if (inUnion == "astc-5x4-unorm") {
    *outEnum = wgpu::TextureFormat::ASTC5x4Unorm;
  } else if (inUnion == "astc-5x4-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ASTC5x4UnormSrgb;
  } else if (inUnion == "astc-5x5-unorm") {
    *outEnum = wgpu::TextureFormat::ASTC5x5Unorm;
  } else if (inUnion == "astc-5x5-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ASTC5x5UnormSrgb;
  } else if (inUnion == "astc-6x5-unorm") {
    *outEnum = wgpu::TextureFormat::ASTC6x5Unorm;
  } else if (inUnion == "astc-6x5-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ASTC6x5UnormSrgb;
  } else if (inUnion == "astc-6x6-unorm") {
    *outEnum = wgpu::TextureFormat::ASTC6x6Unorm;
  } else if (inUnion == "astc-6x6-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ASTC6x6UnormSrgb;
  } else if (inUnion == "astc-8x5-unorm") {
    *outEnum = wgpu::TextureFormat::ASTC8x5Unorm;
  } else if (inUnion == "astc-8x5-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ASTC8x5UnormSrgb;
  } else if (inUnion == "astc-8x6-unorm") {
    *outEnum = wgpu::TextureFormat::ASTC8x6Unorm;
  } else if (inUnion == "astc-8x6-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ASTC8x6UnormSrgb;
  } else if (inUnion == "astc-8x8-unorm") {
    *outEnum = wgpu::TextureFormat::ASTC8x8Unorm;
  } else if (inUnion == "astc-8x8-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ASTC8x8UnormSrgb;
  } else if (inUnion == "astc-10x5-unorm") {
    *outEnum = wgpu::TextureFormat::ASTC10x5Unorm;
  } else if (inUnion == "astc-10x5-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ASTC10x5UnormSrgb;
  } else if (inUnion == "astc-10x6-unorm") {
    *outEnum = wgpu::TextureFormat::ASTC10x6Unorm;
  } else if (inUnion == "astc-10x6-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ASTC10x6UnormSrgb;
  } else if (inUnion == "astc-10x8-unorm") {
    *outEnum = wgpu::TextureFormat::ASTC10x8Unorm;
  } else if (inUnion == "astc-10x8-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ASTC10x8UnormSrgb;
  } else if (inUnion == "astc-10x10-unorm") {
    *outEnum = wgpu::TextureFormat::ASTC10x10Unorm;
  } else if (inUnion == "astc-10x10-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ASTC10x10UnormSrgb;
  } else if (inUnion == "astc-12x10-unorm") {
    *outEnum = wgpu::TextureFormat::ASTC12x10Unorm;
  } else if (inUnion == "astc-12x10-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ASTC12x10UnormSrgb;
  } else if (inUnion == "astc-12x12-unorm") {
    *outEnum = wgpu::TextureFormat::ASTC12x12Unorm;
  } else if (inUnion == "astc-12x12-unorm-srgb") {
    *outEnum = wgpu::TextureFormat::ASTC12x12UnormSrgb;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::TextureFormat inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::TextureFormat::Depth32FloatStencil8:
    *outUnion = "depth32float-stencil8";
    break;
  case wgpu::TextureFormat::R8Unorm:
    *outUnion = "r8unorm";
    break;
  case wgpu::TextureFormat::R8Snorm:
    *outUnion = "r8snorm";
    break;
  case wgpu::TextureFormat::R8Uint:
    *outUnion = "r8uint";
    break;
  case wgpu::TextureFormat::R8Sint:
    *outUnion = "r8sint";
    break;
  case wgpu::TextureFormat::R16Uint:
    *outUnion = "r16uint";
    break;
  case wgpu::TextureFormat::R16Sint:
    *outUnion = "r16sint";
    break;
  case wgpu::TextureFormat::R16Float:
    *outUnion = "r16float";
    break;
  case wgpu::TextureFormat::RG8Unorm:
    *outUnion = "rg8unorm";
    break;
  case wgpu::TextureFormat::RG8Snorm:
    *outUnion = "rg8snorm";
    break;
  case wgpu::TextureFormat::RG8Uint:
    *outUnion = "rg8uint";
    break;
  case wgpu::TextureFormat::RG8Sint:
    *outUnion = "rg8sint";
    break;
  case wgpu::TextureFormat::R32Uint:
    *outUnion = "r32uint";
    break;
  case wgpu::TextureFormat::R32Sint:
    *outUnion = "r32sint";
    break;
  case wgpu::TextureFormat::R32Float:
    *outUnion = "r32float";
    break;
  case wgpu::TextureFormat::RG16Uint:
    *outUnion = "rg16uint";
    break;
  case wgpu::TextureFormat::RG16Sint:
    *outUnion = "rg16sint";
    break;
  case wgpu::TextureFormat::RG16Float:
    *outUnion = "rg16float";
    break;
  case wgpu::TextureFormat::RGBA8Unorm:
    *outUnion = "rgba8unorm";
    break;
  case wgpu::TextureFormat::RGBA8UnormSrgb:
    *outUnion = "rgba8unorm-srgb";
    break;
  case wgpu::TextureFormat::RGBA8Snorm:
    *outUnion = "rgba8snorm";
    break;
  case wgpu::TextureFormat::RGBA8Uint:
    *outUnion = "rgba8uint";
    break;
  case wgpu::TextureFormat::RGBA8Sint:
    *outUnion = "rgba8sint";
    break;
  case wgpu::TextureFormat::BGRA8Unorm:
    *outUnion = "bgra8unorm";
    break;
  case wgpu::TextureFormat::BGRA8UnormSrgb:
    *outUnion = "bgra8unorm-srgb";
    break;
  case wgpu::TextureFormat::RGB9E5Ufloat:
    *outUnion = "rgb9e5ufloat";
    break;
  case wgpu::TextureFormat::RGB10A2Uint:
    *outUnion = "rgb10a2uint";
    break;
  case wgpu::TextureFormat::RGB10A2Unorm:
    *outUnion = "rgb10a2unorm";
    break;
  case wgpu::TextureFormat::RG11B10Ufloat:
    *outUnion = "rg11b10ufloat";
    break;
  case wgpu::TextureFormat::RG32Uint:
    *outUnion = "rg32uint";
    break;
  case wgpu::TextureFormat::RG32Sint:
    *outUnion = "rg32sint";
    break;
  case wgpu::TextureFormat::RG32Float:
    *outUnion = "rg32float";
    break;
  case wgpu::TextureFormat::RGBA16Uint:
    *outUnion = "rgba16uint";
    break;
  case wgpu::TextureFormat::RGBA16Sint:
    *outUnion = "rgba16sint";
    break;
  case wgpu::TextureFormat::RGBA16Float:
    *outUnion = "rgba16float";
    break;
  case wgpu::TextureFormat::RGBA32Uint:
    *outUnion = "rgba32uint";
    break;
  case wgpu::TextureFormat::RGBA32Sint:
    *outUnion = "rgba32sint";
    break;
  case wgpu::TextureFormat::RGBA32Float:
    *outUnion = "rgba32float";
    break;
  case wgpu::TextureFormat::Stencil8:
    *outUnion = "stencil8";
    break;
  case wgpu::TextureFormat::Depth16Unorm:
    *outUnion = "depth16unorm";
    break;
  case wgpu::TextureFormat::Depth24Plus:
    *outUnion = "depth24plus";
    break;
  case wgpu::TextureFormat::Depth24PlusStencil8:
    *outUnion = "depth24plus-stencil8";
    break;
  case wgpu::TextureFormat::Depth32Float:
    *outUnion = "depth32float";
    break;
  case wgpu::TextureFormat::BC1RGBAUnorm:
    *outUnion = "bc1-rgba-unorm";
    break;
  case wgpu::TextureFormat::BC1RGBAUnormSrgb:
    *outUnion = "bc1-rgba-unorm-srgb";
    break;
  case wgpu::TextureFormat::BC2RGBAUnorm:
    *outUnion = "bc2-rgba-unorm";
    break;
  case wgpu::TextureFormat::BC2RGBAUnormSrgb:
    *outUnion = "bc2-rgba-unorm-srgb";
    break;
  case wgpu::TextureFormat::BC3RGBAUnorm:
    *outUnion = "bc3-rgba-unorm";
    break;
  case wgpu::TextureFormat::BC3RGBAUnormSrgb:
    *outUnion = "bc3-rgba-unorm-srgb";
    break;
  case wgpu::TextureFormat::BC4RUnorm:
    *outUnion = "bc4-r-unorm";
    break;
  case wgpu::TextureFormat::BC4RSnorm:
    *outUnion = "bc4-r-snorm";
    break;
  case wgpu::TextureFormat::BC5RGUnorm:
    *outUnion = "bc5-rg-unorm";
    break;
  case wgpu::TextureFormat::BC5RGSnorm:
    *outUnion = "bc5-rg-snorm";
    break;
  case wgpu::TextureFormat::BC6HRGBUfloat:
    *outUnion = "bc6h-rgb-ufloat";
    break;
  case wgpu::TextureFormat::BC6HRGBFloat:
    *outUnion = "bc6h-rgb-float";
    break;
  case wgpu::TextureFormat::BC7RGBAUnorm:
    *outUnion = "bc7-rgba-unorm";
    break;
  case wgpu::TextureFormat::BC7RGBAUnormSrgb:
    *outUnion = "bc7-rgba-unorm-srgb";
    break;
  case wgpu::TextureFormat::ETC2RGB8Unorm:
    *outUnion = "etc2-rgb8unorm";
    break;
  case wgpu::TextureFormat::ETC2RGB8UnormSrgb:
    *outUnion = "etc2-rgb8unorm-srgb";
    break;
  case wgpu::TextureFormat::ETC2RGB8A1Unorm:
    *outUnion = "etc2-rgb8a1unorm";
    break;
  case wgpu::TextureFormat::ETC2RGB8A1UnormSrgb:
    *outUnion = "etc2-rgb8a1unorm-srgb";
    break;
  case wgpu::TextureFormat::ETC2RGBA8Unorm:
    *outUnion = "etc2-rgba8unorm";
    break;
  case wgpu::TextureFormat::ETC2RGBA8UnormSrgb:
    *outUnion = "etc2-rgba8unorm-srgb";
    break;
  case wgpu::TextureFormat::EACR11Unorm:
    *outUnion = "eac-r11unorm";
    break;
  case wgpu::TextureFormat::EACR11Snorm:
    *outUnion = "eac-r11snorm";
    break;
  case wgpu::TextureFormat::EACRG11Unorm:
    *outUnion = "eac-rg11unorm";
    break;
  case wgpu::TextureFormat::EACRG11Snorm:
    *outUnion = "eac-rg11snorm";
    break;
  case wgpu::TextureFormat::ASTC4x4Unorm:
    *outUnion = "astc-4x4-unorm";
    break;
  case wgpu::TextureFormat::ASTC4x4UnormSrgb:
    *outUnion = "astc-4x4-unorm-srgb";
    break;
  case wgpu::TextureFormat::ASTC5x4Unorm:
    *outUnion = "astc-5x4-unorm";
    break;
  case wgpu::TextureFormat::ASTC5x4UnormSrgb:
    *outUnion = "astc-5x4-unorm-srgb";
    break;
  case wgpu::TextureFormat::ASTC5x5Unorm:
    *outUnion = "astc-5x5-unorm";
    break;
  case wgpu::TextureFormat::ASTC5x5UnormSrgb:
    *outUnion = "astc-5x5-unorm-srgb";
    break;
  case wgpu::TextureFormat::ASTC6x5Unorm:
    *outUnion = "astc-6x5-unorm";
    break;
  case wgpu::TextureFormat::ASTC6x5UnormSrgb:
    *outUnion = "astc-6x5-unorm-srgb";
    break;
  case wgpu::TextureFormat::ASTC6x6Unorm:
    *outUnion = "astc-6x6-unorm";
    break;
  case wgpu::TextureFormat::ASTC6x6UnormSrgb:
    *outUnion = "astc-6x6-unorm-srgb";
    break;
  case wgpu::TextureFormat::ASTC8x5Unorm:
    *outUnion = "astc-8x5-unorm";
    break;
  case wgpu::TextureFormat::ASTC8x5UnormSrgb:
    *outUnion = "astc-8x5-unorm-srgb";
    break;
  case wgpu::TextureFormat::ASTC8x6Unorm:
    *outUnion = "astc-8x6-unorm";
    break;
  case wgpu::TextureFormat::ASTC8x6UnormSrgb:
    *outUnion = "astc-8x6-unorm-srgb";
    break;
  case wgpu::TextureFormat::ASTC8x8Unorm:
    *outUnion = "astc-8x8-unorm";
    break;
  case wgpu::TextureFormat::ASTC8x8UnormSrgb:
    *outUnion = "astc-8x8-unorm-srgb";
    break;
  case wgpu::TextureFormat::ASTC10x5Unorm:
    *outUnion = "astc-10x5-unorm";
    break;
  case wgpu::TextureFormat::ASTC10x5UnormSrgb:
    *outUnion = "astc-10x5-unorm-srgb";
    break;
  case wgpu::TextureFormat::ASTC10x6Unorm:
    *outUnion = "astc-10x6-unorm";
    break;
  case wgpu::TextureFormat::ASTC10x6UnormSrgb:
    *outUnion = "astc-10x6-unorm-srgb";
    break;
  case wgpu::TextureFormat::ASTC10x8Unorm:
    *outUnion = "astc-10x8-unorm";
    break;
  case wgpu::TextureFormat::ASTC10x8UnormSrgb:
    *outUnion = "astc-10x8-unorm-srgb";
    break;
  case wgpu::TextureFormat::ASTC10x10Unorm:
    *outUnion = "astc-10x10-unorm";
    break;
  case wgpu::TextureFormat::ASTC10x10UnormSrgb:
    *outUnion = "astc-10x10-unorm-srgb";
    break;
  case wgpu::TextureFormat::ASTC12x10Unorm:
    *outUnion = "astc-12x10-unorm";
    break;
  case wgpu::TextureFormat::ASTC12x10UnormSrgb:
    *outUnion = "astc-12x10-unorm-srgb";
    break;
  case wgpu::TextureFormat::ASTC12x12Unorm:
    *outUnion = "astc-12x12-unorm";
    break;
  case wgpu::TextureFormat::ASTC12x12UnormSrgb:
    *outUnion = "astc-12x12-unorm-srgb";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::TextureSampleType *outEnum) {
  if (inUnion == "float") {
    *outEnum = wgpu::TextureSampleType::Float;
  } else if (inUnion == "unfilterable-float") {
    *outEnum = wgpu::TextureSampleType::UnfilterableFloat;
  } else if (inUnion == "depth") {
    *outEnum = wgpu::TextureSampleType::Depth;
  } else if (inUnion == "sint") {
    *outEnum = wgpu::TextureSampleType::Sint;
  } else if (inUnion == "uint") {
    *outEnum = wgpu::TextureSampleType::Uint;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::TextureSampleType inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::TextureSampleType::Float:
    *outUnion = "float";
    break;
  case wgpu::TextureSampleType::UnfilterableFloat:
    *outUnion = "unfilterable-float";
    break;
  case wgpu::TextureSampleType::Depth:
    *outUnion = "depth";
    break;
  case wgpu::TextureSampleType::Sint:
    *outUnion = "sint";
    break;
  case wgpu::TextureSampleType::Uint:
    *outUnion = "uint";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::TextureViewDimension *outEnum) {
  if (inUnion == "1d") {
    *outEnum = wgpu::TextureViewDimension::e1D;
  } else if (inUnion == "2d") {
    *outEnum = wgpu::TextureViewDimension::e2D;
  } else if (inUnion == "3d") {
    *outEnum = wgpu::TextureViewDimension::e3D;
  } else if (inUnion == "2d-array") {
    *outEnum = wgpu::TextureViewDimension::e2DArray;
  } else if (inUnion == "cube") {
    *outEnum = wgpu::TextureViewDimension::Cube;
  } else if (inUnion == "cube-array") {
    *outEnum = wgpu::TextureViewDimension::CubeArray;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::TextureViewDimension inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::TextureViewDimension::e1D:
    *outUnion = "1d";
    break;
  case wgpu::TextureViewDimension::e2D:
    *outUnion = "2d";
    break;
  case wgpu::TextureViewDimension::e3D:
    *outUnion = "3d";
    break;
  case wgpu::TextureViewDimension::e2DArray:
    *outUnion = "2d-array";
    break;
  case wgpu::TextureViewDimension::Cube:
    *outUnion = "cube";
    break;
  case wgpu::TextureViewDimension::CubeArray:
    *outUnion = "cube-array";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::VertexFormat *outEnum) {
  if (inUnion == "uint32") {
    *outEnum = wgpu::VertexFormat::Uint32;
  } else if (inUnion == "uint8x2") {
    *outEnum = wgpu::VertexFormat::Uint8x2;
  } else if (inUnion == "uint8x4") {
    *outEnum = wgpu::VertexFormat::Uint8x4;
  } else if (inUnion == "sint8x2") {
    *outEnum = wgpu::VertexFormat::Sint8x2;
  } else if (inUnion == "sint8x4") {
    *outEnum = wgpu::VertexFormat::Sint8x4;
  } else if (inUnion == "unorm8x2") {
    *outEnum = wgpu::VertexFormat::Unorm8x2;
  } else if (inUnion == "unorm8x4") {
    *outEnum = wgpu::VertexFormat::Unorm8x4;
  } else if (inUnion == "snorm8x2") {
    *outEnum = wgpu::VertexFormat::Snorm8x2;
  } else if (inUnion == "snorm8x4") {
    *outEnum = wgpu::VertexFormat::Snorm8x4;
  } else if (inUnion == "uint16x2") {
    *outEnum = wgpu::VertexFormat::Uint16x2;
  } else if (inUnion == "uint16x4") {
    *outEnum = wgpu::VertexFormat::Uint16x4;
  } else if (inUnion == "sint16x2") {
    *outEnum = wgpu::VertexFormat::Sint16x2;
  } else if (inUnion == "sint16x4") {
    *outEnum = wgpu::VertexFormat::Sint16x4;
  } else if (inUnion == "unorm16x2") {
    *outEnum = wgpu::VertexFormat::Unorm16x2;
  } else if (inUnion == "unorm16x4") {
    *outEnum = wgpu::VertexFormat::Unorm16x4;
  } else if (inUnion == "snorm16x2") {
    *outEnum = wgpu::VertexFormat::Snorm16x2;
  } else if (inUnion == "snorm16x4") {
    *outEnum = wgpu::VertexFormat::Snorm16x4;
  } else if (inUnion == "float16x2") {
    *outEnum = wgpu::VertexFormat::Float16x2;
  } else if (inUnion == "float16x4") {
    *outEnum = wgpu::VertexFormat::Float16x4;
  } else if (inUnion == "float32") {
    *outEnum = wgpu::VertexFormat::Float32;
  } else if (inUnion == "float32x2") {
    *outEnum = wgpu::VertexFormat::Float32x2;
  } else if (inUnion == "float32x3") {
    *outEnum = wgpu::VertexFormat::Float32x3;
  } else if (inUnion == "float32x4") {
    *outEnum = wgpu::VertexFormat::Float32x4;
  } else if (inUnion == "uint32x2") {
    *outEnum = wgpu::VertexFormat::Uint32x2;
  } else if (inUnion == "uint32x3") {
    *outEnum = wgpu::VertexFormat::Uint32x3;
  } else if (inUnion == "uint32x4") {
    *outEnum = wgpu::VertexFormat::Uint32x4;
  } else if (inUnion == "sint32") {
    *outEnum = wgpu::VertexFormat::Sint32;
  } else if (inUnion == "sint32x2") {
    *outEnum = wgpu::VertexFormat::Sint32x2;
  } else if (inUnion == "sint32x3") {
    *outEnum = wgpu::VertexFormat::Sint32x3;
  } else if (inUnion == "sint32x4") {
    *outEnum = wgpu::VertexFormat::Sint32x4;
  } else if (inUnion == "unorm10-10-10-2") {
    *outEnum = wgpu::VertexFormat::Unorm10_10_10_2;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::VertexFormat inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::VertexFormat::Uint32:
    *outUnion = "uint32";
    break;
  case wgpu::VertexFormat::Uint8x2:
    *outUnion = "uint8x2";
    break;
  case wgpu::VertexFormat::Uint8x4:
    *outUnion = "uint8x4";
    break;
  case wgpu::VertexFormat::Sint8x2:
    *outUnion = "sint8x2";
    break;
  case wgpu::VertexFormat::Sint8x4:
    *outUnion = "sint8x4";
    break;
  case wgpu::VertexFormat::Unorm8x2:
    *outUnion = "unorm8x2";
    break;
  case wgpu::VertexFormat::Unorm8x4:
    *outUnion = "unorm8x4";
    break;
  case wgpu::VertexFormat::Snorm8x2:
    *outUnion = "snorm8x2";
    break;
  case wgpu::VertexFormat::Snorm8x4:
    *outUnion = "snorm8x4";
    break;
  case wgpu::VertexFormat::Uint16x2:
    *outUnion = "uint16x2";
    break;
  case wgpu::VertexFormat::Uint16x4:
    *outUnion = "uint16x4";
    break;
  case wgpu::VertexFormat::Sint16x2:
    *outUnion = "sint16x2";
    break;
  case wgpu::VertexFormat::Sint16x4:
    *outUnion = "sint16x4";
    break;
  case wgpu::VertexFormat::Unorm16x2:
    *outUnion = "unorm16x2";
    break;
  case wgpu::VertexFormat::Unorm16x4:
    *outUnion = "unorm16x4";
    break;
  case wgpu::VertexFormat::Snorm16x2:
    *outUnion = "snorm16x2";
    break;
  case wgpu::VertexFormat::Snorm16x4:
    *outUnion = "snorm16x4";
    break;
  case wgpu::VertexFormat::Float16x2:
    *outUnion = "float16x2";
    break;
  case wgpu::VertexFormat::Float16x4:
    *outUnion = "float16x4";
    break;
  case wgpu::VertexFormat::Float32:
    *outUnion = "float32";
    break;
  case wgpu::VertexFormat::Float32x2:
    *outUnion = "float32x2";
    break;
  case wgpu::VertexFormat::Float32x3:
    *outUnion = "float32x3";
    break;
  case wgpu::VertexFormat::Float32x4:
    *outUnion = "float32x4";
    break;
  case wgpu::VertexFormat::Uint32x2:
    *outUnion = "uint32x2";
    break;
  case wgpu::VertexFormat::Uint32x3:
    *outUnion = "uint32x3";
    break;
  case wgpu::VertexFormat::Uint32x4:
    *outUnion = "uint32x4";
    break;
  case wgpu::VertexFormat::Sint32:
    *outUnion = "sint32";
    break;
  case wgpu::VertexFormat::Sint32x2:
    *outUnion = "sint32x2";
    break;
  case wgpu::VertexFormat::Sint32x3:
    *outUnion = "sint32x3";
    break;
  case wgpu::VertexFormat::Sint32x4:
    *outUnion = "sint32x4";
    break;
  case wgpu::VertexFormat::Unorm10_10_10_2:
    *outUnion = "unorm10-10-10-2";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 wgpu::VertexStepMode *outEnum) {
  if (inUnion == "vertex") {
    *outEnum = wgpu::VertexStepMode::Vertex;
  } else if (inUnion == "instance") {
    *outEnum = wgpu::VertexStepMode::Instance;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(wgpu::VertexStepMode inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::VertexStepMode::Vertex:
    *outUnion = "vertex";
    break;
  case wgpu::VertexStepMode::Instance:
    *outUnion = "instance";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 rnwgpu::PredefinedColorSpace *outEnum) {
  if (inUnion == "display-p3") {
    *outEnum = rnwgpu::PredefinedColorSpace::DisplayP3;
  } else if (inUnion == "srgb") {
    *outEnum = rnwgpu::PredefinedColorSpace::Srgb;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(rnwgpu::PredefinedColorSpace inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case rnwgpu::PredefinedColorSpace::DisplayP3:
    *outUnion = "display-p3";
    break;
  case rnwgpu::PredefinedColorSpace::Srgb:
    *outUnion = "srgb";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

inline void convertJSUnionToEnum(const std::string &inUnion,
                                 rnwgpu::PremultiplyAlpha *outEnum) {
  if (inUnion == "none") {
    *outEnum = rnwgpu::PremultiplyAlpha::None;
  } else if (inUnion == "default") {
    *outEnum = rnwgpu::PremultiplyAlpha::Default;
  } else if (inUnion == "premultiply") {
    *outEnum = rnwgpu::PremultiplyAlpha::Premultiply;
  } else {
    throw invalidUnion(inUnion);
  }
}

inline void convertEnumToJSUnion(rnwgpu::PremultiplyAlpha inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case rnwgpu::PremultiplyAlpha::None:
    *outUnion = "none";
    break;
  case rnwgpu::PremultiplyAlpha::Default:
    *outUnion = "default";
    break;
  case rnwgpu::PremultiplyAlpha::Premultiply:
    *outUnion = "premultiply";
    break;
  default:
    throw invalidEnum(inEnum);
  }
}

} // namespace EnumMapper
} // namespace rnwgpu
