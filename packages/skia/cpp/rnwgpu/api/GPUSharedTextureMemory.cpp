#include "GPUSharedTextureMemory.h"

#include <cstdint>
#include <memory>
#include <optional>
#include <stdexcept>
#include <string>
#include <vector>

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

void GPUSharedTextureMemory::beginAccess(
    std::shared_ptr<GPUTexture> texture, bool initialized,
    std::optional<std::vector<std::shared_ptr<GPUSharedFenceState>>> fences) {
  if (!texture) {
    throw std::runtime_error(
        "GPUSharedTextureMemory::beginAccess(): texture is null");
  }
  wgpu::SharedTextureMemoryBeginAccessDescriptor desc{};
  desc.initialized = initialized;
  desc.concurrentRead = false;

  // Built in lockstep so fenceCount covers both arrays, and kept in locals so
  // the raw pointers outlive the synchronous BeginAccess() below.
  std::vector<wgpu::SharedFence> rawFences;
  std::vector<uint64_t> values;
  if (fences.has_value()) {
    for (const auto &state : *fences) {
      if (state && state->fence) {
        rawFences.push_back(state->fence->get());
        values.push_back(state->signaledValue);
      }
    }
  }
  if (!rawFences.empty()) {
    desc.fenceCount = rawFences.size();
    desc.fences = rawFences.data();
    desc.signaledValues = values.data();
  } else {
    desc.fenceCount = 0;
    desc.fences = nullptr;
    desc.signaledValues = nullptr;
  }

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
  if (!status) {
    throw std::runtime_error("GPUSharedTextureMemory::beginAccess() failed");
  }
}

jsi::Value GPUSharedTextureMemory::endAccess(jsi::Runtime &runtime,
                                             const jsi::Value &,
                                             const jsi::Value *args,
                                             size_t count) {
  if (count < 1 || !args[0].isObject()) {
    throw jsi::JSError(
        runtime, "GPUSharedTextureMemory::endAccess(): expected (texture)");
  }
  auto texture = GPUTexture::fromValue(runtime, args[0]);

  wgpu::SharedTextureMemoryEndAccessState state{};

#if defined(__ANDROID__)
  // Dawn's Vulkan backend writes the released old/new VkImageLayouts back into
  // a chained SharedTextureMemoryVkImageLayoutEndState; validation requires
  // the chain even when the caller doesn't read the values.
  wgpu::SharedTextureMemoryVkImageLayoutEndState vkLayout{};
  state.nextInChain = &vkLayout;
#endif

  auto status = _instance.EndAccess(texture->get(), &state);
  if (!status) {
    throw jsi::JSError(runtime, "GPUSharedTextureMemory::endAccess() failed");
  }

  // Copy each wgpu::SharedFence (ref-counted) into its own GPUSharedFence
  // wrapper before `state` is destroyed.
  jsi::Array fences(runtime, state.fenceCount);
  for (size_t i = 0; i < state.fenceCount; i++) {
    wgpu::SharedFence fence = state.fences[i];
    auto wrapper = std::make_shared<GPUSharedFence>(std::move(fence), "");
    jsi::Object entry(runtime);
    entry.setProperty(runtime, "fence",
                      GPUSharedFence::create(runtime, std::move(wrapper)));
    entry.setProperty(
        runtime, "signaledValue",
        jsi::BigInt::fromUint64(runtime, state.signaledValues[i]));
    fences.setValueAtIndex(runtime, i, std::move(entry));
  }

  jsi::Object result(runtime);
  result.setProperty(runtime, "initialized",
                     jsi::Value(static_cast<bool>(state.initialized)));
  result.setProperty(runtime, "fences", std::move(fences));
  return result;
}

} // namespace rnwgpu
