#pragma once

#include <cstdint>
#include <memory>
#include <utility>
#include <vector>

#include "jsi2/NativeObject.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

// DRAFT — compile-unverified. Minimal ImageBitmap holding decoded, unpremul
// RGBA8 pixels plus its dimensions. Produced by the global createImageBitmap()
// binding (see RNSkManager.cpp). Decoding is done with Skia's own codec, so no
// platform-specific image decoder is required.
//
// FOLLOW-UP: to make an ImageBitmap usable as a copyExternalImageToTexture
// source, uncomment the `source` field + ImageBitmap converter in
// rnwgpu/api/descriptors/GPUImageCopyExternalImage.h and upload `data()` in
// GPUQueue::copyExternalImageToTexture. That GPU wiring is intentionally out of
// scope for this draft.
class ImageBitmap : public NativeObject<ImageBitmap> {
public:
  static constexpr const char *CLASS_NAME = "ImageBitmap";

  ImageBitmap(std::vector<uint8_t> data, size_t width, size_t height)
      : NativeObject(CLASS_NAME), _data(std::move(data)), _width(width),
        _height(height) {}

  size_t getWidth() { return _width; }

  size_t getHeight() { return _height; }

  // Per the spec, close() releases the bitmap's underlying pixels and zeroes
  // its dimensions. Idempotent.
  void close() {
    _data.clear();
    _data.shrink_to_fit();
    _width = 0;
    _height = 0;
  }

  // Decoded, unpremultiplied RGBA8 pixels (row-major, width*height*4 bytes).
  const std::vector<uint8_t> &data() const { return _data; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "width", &ImageBitmap::getWidth);
    installGetter(runtime, prototype, "height", &ImageBitmap::getHeight);
    installMethod(runtime, prototype, "close", &ImageBitmap::close);
  }

  size_t getMemoryPressure() override { return _data.size(); }

private:
  std::vector<uint8_t> _data;
  size_t _width;
  size_t _height;
};

} // namespace rnwgpu
