#pragma once

#include <string>

#include <cstdio>

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

static void convertEnumToJSUnion(wgpu::FeatureName inEnum,
                                 std::string *outUnion) {
  switch (inEnum) {
  case wgpu::FeatureName::DepthClipControl:
    *outUnion = "depth-clip-control";
    break;
  case wgpu::FeatureName::Depth32FloatStencil8:
    *outUnion = "depth32float-stencil8";
    break;
  case wgpu::FeatureName::TimestampQuery:
    *outUnion = "timestamp-query";
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
  case wgpu::FeatureName::ChromiumExperimentalTimestampQueryInsidePasses:
    *outUnion = "chromium-experimental-timestamp-query-inside-passes";
    break;
  case wgpu::FeatureName::ImplicitDeviceSynchronization:
    *outUnion = "implicit-device-synchronization";
    break;
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
  case wgpu::FeatureName::DawnFormatCapabilities:
    *outUnion = "format-capabilities";
    break;
  case wgpu::FeatureName::DawnDrmFormatCapabilities:
    *outUnion = "drm-format-capabilities";
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
  case wgpu::FeatureName::SharedFenceSyncFD:
    *outUnion = "shared-fence-vk-semaphore-sync-fd";
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
  default:
    fprintf(stderr, "Unknown feature name %d\n", static_cast<int>(inEnum));
    *outUnion = "";
  }
}

} // namespace rnwgpu
