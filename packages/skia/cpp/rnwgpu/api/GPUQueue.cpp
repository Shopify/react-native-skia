#include "GPUQueue.h"

#include <cstring>
#include <limits>
#include <memory>
#include <vector>

#include "Convertors.h"

namespace rnwgpu {

struct BufferSource {
  void *data;
  size_t size;            // in bytes
  size_t bytesPerElement; // 1 for ArrayBuffers
};

void GPUQueue::submit(
    std::vector<std::shared_ptr<GPUCommandBuffer>> commandBuffers) {
  std::vector<wgpu::CommandBuffer> bufs(commandBuffers.size());
  for (size_t i = 0; i < commandBuffers.size(); i++) {
    bufs[i] = commandBuffers[i]->get();
  }
  Convertor conv;
  uint32_t bufs_size;
  if (!conv(bufs_size, bufs.size())) {
    return;
  }
  _instance.Submit(bufs_size, bufs.data());
}

void GPUQueue::writeBuffer(std::shared_ptr<GPUBuffer> buffer,
                           uint64_t bufferOffset,
                           std::shared_ptr<ArrayBuffer> data,
                           std::optional<uint64_t> dataOffsetElements,
                           std::optional<size_t> sizeElements) {
  wgpu::Buffer buf = buffer->get();
  BufferSource src{.data = data->_data,
                   .size = data->_size,
                   .bytesPerElement = data->_bytesPerElement};

  // Note that in the JS semantics of WebGPU, writeBuffer works in number of
  // elements of the typed arrays.
  if (dataOffsetElements >
      static_cast<uint64_t>(src.size / src.bytesPerElement)) {
    throw std::runtime_error("dataOffset is larger than data's size.");
    return;
  }
  uint64_t dataOffset = dataOffsetElements.value_or(0) * src.bytesPerElement;
  src.data = reinterpret_cast<uint8_t *>(src.data) + dataOffset;
  src.size -= dataOffset;

  // Size defaults to dataSize - dataOffset. Instead of computing in elements,
  // we directly use it in bytes, and convert the provided value, if any, in
  // bytes.
  uint64_t size64 = static_cast<uint64_t>(src.size);
  if (sizeElements.has_value()) {
    if (sizeElements.value() >
        std::numeric_limits<uint64_t>::max() / src.bytesPerElement) {
      throw std::runtime_error("size overflows.");
      return;
    }
    size64 = sizeElements.value() * src.bytesPerElement;
  }

  if (size64 > static_cast<uint64_t>(src.size)) {
    throw std::runtime_error("size + dataOffset is larger than data's size.");
    return;
  }

  if (size64 % 4 != 0) {
    throw std::runtime_error("size is not a multiple of 4 bytes.");

    return;
  }

  assert(size64 <= std::numeric_limits<size_t>::max());
  _instance.WriteBuffer(buf, bufferOffset, src.data,
                        static_cast<size_t>(size64));
}

async::AsyncTaskHandle GPUQueue::onSubmittedWorkDone() {
  auto queue = _instance;
  return _async->postTask(
      [queue](const async::AsyncTaskHandle::ResolveFunction &resolve,
              const async::AsyncTaskHandle::RejectFunction &reject) {
        queue.OnSubmittedWorkDone(
            wgpu::CallbackMode::AllowProcessEvents,
            [resolve, reject](wgpu::QueueWorkDoneStatus status,
                              wgpu::StringView message) {
              if (status == wgpu::QueueWorkDoneStatus::Success) {
                resolve(nullptr);
              } else {
                std::string error =
                    message.length ? std::string(message.data, message.length)
                                   : "Queue work did not complete successfully";
                reject(std::move(error));
              }
            });
      });
}

void GPUQueue::copyExternalImageToTexture(
    std::shared_ptr<GPUImageCopyExternalImage> source,
    std::shared_ptr<GPUImageCopyTextureTagged> destination,
    std::shared_ptr<GPUExtent3D> size) {
  if (!source || source->source == nullptr) {
    throw std::runtime_error("GPUQueue::copyExternalImageToTexture(): "
                             "source.source (ImageBitmap) is required");
  }
  // ImageBitmap holds decoded, row-major RGBA8 pixels. We upload them with
  // WriteTexture (a CPU staging copy) rather than a GPU blit; that is enough
  // for the common "decode an image, sample it" path and avoids needing a
  // source GPUTexture.
  const auto &pixels = source->source->data();
  auto width = static_cast<uint32_t>(source->source->getWidth());
  auto height = static_cast<uint32_t>(source->source->getHeight());
  if (pixels.empty() || width == 0 || height == 0) {
    throw std::runtime_error("GPUQueue::copyExternalImageToTexture(): "
                             "ImageBitmap has no pixels (was it closed?)");
  }
  auto bytesPerPixel = static_cast<uint32_t>(
      pixels.size() / (static_cast<size_t>(width) * height));
  uint32_t rowSize = bytesPerPixel * width;

  wgpu::TexelCopyTextureInfo dst{};
  wgpu::TexelCopyBufferLayout layout{};
  wgpu::Extent3D sz{};
  Convertor conv;
  auto dataLayout = std::make_shared<GPUImageDataLayout>(
      GPUImageDataLayout{std::optional<double>{0.0},
                         std::optional<double>{static_cast<double>(rowSize)},
                         std::optional<double>{static_cast<double>(height)}});
  if (!conv(dst.aspect, destination->aspect) ||
      !conv(dst.mipLevel, destination->mipLevel) ||
      !conv(dst.origin, destination->origin) ||
      !conv(dst.texture, destination->texture) || !conv(layout, dataLayout) ||
      !conv(sz, size)) {
    throw std::runtime_error(
        "Invalid input for GPUQueue::copyExternalImageToTexture()");
  }

  if (source->flipY.value_or(false)) {
    // Flip rows so the image is uploaded bottom-up (matches the WebGPU
    // copyExternalImageToTexture flipY semantics).
    std::vector<uint8_t> flippedData(pixels.size());
    for (uint32_t row = 0; row < height; ++row) {
      std::memcpy(flippedData.data() + (height - 1 - row) * rowSize,
                  pixels.data() + row * rowSize, rowSize);
    }
    _instance.WriteTexture(&dst, flippedData.data(), flippedData.size(),
                           &layout, &sz);
  } else {
    _instance.WriteTexture(&dst, pixels.data(), pixels.size(), &layout, &sz);
  }
}

void GPUQueue::writeTexture(std::shared_ptr<GPUImageCopyTexture> destination,
                            std::shared_ptr<ArrayBuffer> data,
                            std::shared_ptr<GPUImageDataLayout> dataLayout,
                            std::shared_ptr<GPUExtent3D> size) {
  wgpu::TexelCopyTextureInfo dst{};
  wgpu::TexelCopyBufferLayout layout{};
  wgpu::Extent3D sz{};
  Convertor conv;
  if (!conv(dst, destination) ||   //
      !conv(layout, dataLayout) || //
      !conv(sz, size)) {
    throw std::runtime_error("Invalid input for GPUQueue::writeTexture()");
  }

  _instance.WriteTexture(&dst, data->_data, data->_size, &layout, &sz);
}

} // namespace rnwgpu
