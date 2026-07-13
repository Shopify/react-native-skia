#include "GPUExternalTexture.h"

#include <cmath>
#include <memory>
#include <string>
#include <utility>

#include "NativeBufferUtils.h"
#include "descriptors/GPUExternalTextureDescriptor.h"

namespace rnwgpu {

// Identity gamut (same primaries) as a 3x3 column-major matrix.
static const float kIdentityGamutMatrix[9] = {
    1.0f, 0.0f, 0.0f, //
    0.0f, 1.0f, 0.0f, //
    0.0f, 0.0f, 1.0f, //
};

// Identity transfer (y = x). The native buffers produced by Skia's NativeBuffer
// API are single-plane BGRA/RGBA already in the render target's color space, so
// no conversion is wanted. Dawn dereferences the transfer-function arrays
// unconditionally (ComputeExternalTextureParams), so these must be non-null.
static const float kIdentityTransferParams[7] = {
    1.0f, // G
    1.0f, // A
    0.0f, // B
    0.0f, // C
    0.0f, // D
    0.0f, // E
    0.0f, // F
};

// Map a rotation in degrees (0 / 90 / 180 / 270) to Dawn's enum. Anything that
// isn't a clean multiple of 90 snaps to the nearest quadrant; Dawn only
// supports those four steps for external textures.
static wgpu::ExternalTextureRotation toExternalTextureRotation(double degrees) {
  int quadrant = static_cast<int>(std::lround(degrees / 90.0));
  quadrant = ((quadrant % 4) + 4) % 4;
  switch (quadrant) {
  case 1:
    return wgpu::ExternalTextureRotation::Rotate90Degrees;
  case 2:
    return wgpu::ExternalTextureRotation::Rotate180Degrees;
  case 3:
    return wgpu::ExternalTextureRotation::Rotate270Degrees;
  default:
    return wgpu::ExternalTextureRotation::Rotate0Degrees;
  }
}

std::shared_ptr<GPUExternalTexture> GPUExternalTexture::Create(
    wgpu::Device device,
    std::shared_ptr<GPUExternalTextureDescriptor> descriptor) {
  if (!descriptor || descriptor->source == 0) {
    throw std::runtime_error(
        "GPUExternalTexture::Create(): descriptor.source (a native buffer "
        "pointer from Skia.NativeBuffer.MakeFromImage) is required");
  }
  void *bufferPtr =
      reinterpret_cast<void *>(static_cast<uintptr_t>(descriptor->source));
  std::string label = descriptor->label.value_or("external-texture");

  // 1. Import the native buffer as SharedTextureMemory and read its dimensions.
  uint32_t width = 0;
  uint32_t height = 0;
  wgpu::SharedTextureMemory memory = importNativeBufferAsSharedTextureMemory(
      device, bufferPtr, label, &width, &height);
  if (memory == nullptr) {
    throw std::runtime_error(
        "GPUExternalTexture::Create(): ImportSharedTextureMemory returned "
        "null");
  }

  // 2. Create the texture from the surface (Dawn picks the single-plane
  //    BGRA/RGBA format).
  auto texture = memory.CreateTexture();
  if (texture == nullptr) {
    throw std::runtime_error(
        "GPUExternalTexture::Create(): CreateTexture returned null");
  }

  // 3. Begin access. The matching EndAccess runs when the GPUExternalTexture is
  //    destroyed (explicitly via destroy() or at GC).
  wgpu::SharedTextureMemoryBeginAccessDescriptor begin{};
  begin.initialized = true;
  begin.concurrentRead = false;
#if defined(__ANDROID__)
  // Dawn's Vulkan backend requires the acquired VkImageLayout to be chained.
  // UNDEFINED (= 0) on both ends is the canonical "no prior GPU producer"
  // pattern (matches GPUSharedTextureMemory::beginAccess).
  wgpu::SharedTextureMemoryVkImageLayoutBeginState vkBegin{};
  vkBegin.oldLayout = 0;
  vkBegin.newLayout = 0;
  begin.nextInChain = &vkBegin;
#endif
  if (!memory.BeginAccess(texture, &begin)) {
    throw std::runtime_error(
        "GPUExternalTexture::Create(): BeginAccess failed");
  }

  // 4. Single-plane view (the whole BGRA/RGBA surface).
  auto plane0 = texture.CreateView();

  // 5. Build the ExternalTextureDescriptor. The surface is already RGB in the
  //    target color space, so pass it through with identity transfer/gamut.
  wgpu::ExternalTextureDescriptor extDesc{};
  if (!label.empty()) {
    extDesc.label = wgpu::StringView(label.c_str(), label.size());
  }
  extDesc.plane0 = plane0;
  extDesc.gamutConversionMatrix = kIdentityGamutMatrix;
  extDesc.srcTransferFunctionParameters = kIdentityTransferParams;
  extDesc.dstTransferFunctionParameters = kIdentityTransferParams;
  extDesc.cropOrigin = {0, 0};
  extDesc.cropSize = {width, height};
  extDesc.apparentSize = {width, height};
  extDesc.mirrored = descriptor->mirrored.value_or(false);
  extDesc.rotation =
      toExternalTextureRotation(descriptor->rotation.value_or(0));

  auto external = device.CreateExternalTexture(&extDesc);
  if (external == nullptr) {
    wgpu::SharedTextureMemoryEndAccessState state{};
#if defined(__ANDROID__)
    wgpu::SharedTextureMemoryVkImageLayoutEndState vkEnd{};
    state.nextInChain = &vkEnd;
#endif
    (void)memory.EndAccess(texture, &state);
    throw std::runtime_error(
        "GPUExternalTexture::Create(): CreateExternalTexture returned null");
  }

  return std::make_shared<GPUExternalTexture>(
      std::move(external), std::move(memory), std::move(texture),
      std::move(label));
}

} // namespace rnwgpu
