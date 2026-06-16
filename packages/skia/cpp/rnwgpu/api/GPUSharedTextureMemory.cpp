#include "GPUSharedTextureMemory.h"

#include <memory>
#include <stdexcept>
#include <string>

#include "Convertors.h"

namespace rnwgpu {

std::shared_ptr<GPUTexture> GPUSharedTextureMemory::createTexture(
    std::optional<std::shared_ptr<GPUTextureDescriptor>> descriptor) {
  if (!descriptor.has_value() || descriptor.value() == nullptr) {
    auto texture = _instance.CreateTexture();
    // The texture aliases the shared memory; it doesn't own GPU allocation, so
    // it doesn't report memory pressure.
    return std::make_shared<GPUTexture>(texture, "", false);
  }

  wgpu::TextureDescriptor desc{};
  Convertor conv;
  if (!conv(desc, descriptor.value())) {
    throw std::runtime_error(
        "GPUSharedTextureMemory::createTexture(): Error with "
        "GPUTextureDescriptor");
  }
  auto texture = _instance.CreateTexture(&desc);
  return std::make_shared<GPUTexture>(
      texture, descriptor.value()->label.value_or(""), false);
}

bool GPUSharedTextureMemory::beginAccess(std::shared_ptr<GPUTexture> texture,
                                         bool initialized) {
  if (!texture) {
    throw std::runtime_error(
        "GPUSharedTextureMemory::beginAccess(): texture is null");
  }
  wgpu::SharedTextureMemoryBeginAccessDescriptor desc{};
  desc.initialized = initialized;
  desc.concurrentRead = false;
  desc.fenceCount = 0;
  desc.fences = nullptr;
  desc.signaledValues = nullptr;

#if defined(__ANDROID__)
  // Dawn's Vulkan backend (AHardwareBuffer) validates that the begin-access
  // descriptor chains a SharedTextureMemoryVkImageLayoutBeginState specifying
  // the VkImageLayout to acquire the image into. UNDEFINED (= 0) on both ends
  // is the canonical "no prior GPU producer" pattern: Dawn performs an
  // external-queue acquire from VK_QUEUE_FAMILY_EXTERNAL which preserves the
  // AHB contents, then transitions to whatever layout the texture's actual
  // usage requires.
  wgpu::SharedTextureMemoryVkImageLayoutBeginState vkLayout{};
  vkLayout.oldLayout = 0;
  vkLayout.newLayout = 0;
  desc.nextInChain = &vkLayout;
#endif

  auto status = _instance.BeginAccess(texture->get(), &desc);
  return static_cast<bool>(status);
}

bool GPUSharedTextureMemory::endAccess(std::shared_ptr<GPUTexture> texture) {
  if (!texture) {
    throw std::runtime_error(
        "GPUSharedTextureMemory::endAccess(): texture is null");
  }
  wgpu::SharedTextureMemoryEndAccessState state{};

#if defined(__ANDROID__)
  // Dawn's Vulkan backend writes the released old/new VkImageLayouts back into
  // a chained SharedTextureMemoryVkImageLayoutEndState; validation requires
  // the chain even when the caller doesn't read the values.
  wgpu::SharedTextureMemoryVkImageLayoutEndState vkLayout{};
  state.nextInChain = &vkLayout;
#endif

  auto status = _instance.EndAccess(texture->get(), &state);
  return static_cast<bool>(status);
}

} // namespace rnwgpu
