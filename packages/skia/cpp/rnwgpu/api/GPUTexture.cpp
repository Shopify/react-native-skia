#include "GPUTexture.h"

#include <memory>

#include "Convertors.h"

namespace rnwgpu {

void GPUTexture::destroy() { _instance.Destroy(); }

std::shared_ptr<GPUTextureView> GPUTexture::createView(
    std::optional<std::shared_ptr<GPUTextureViewDescriptor>> descriptor) {
  wgpu::TextureViewDescriptor desc;
  Convertor conv;
  if (!conv(desc, descriptor)) {
    throw std::runtime_error("GPUTextureView.createView(): couldn't access "
                             "GPUTextureViewDescriptor");
  }
  auto view = _instance.CreateView(&desc);
  return std::make_shared<GPUTextureView>(
      view,
      descriptor.has_value() ? descriptor.value()->label.value_or("") : "");
}

uint32_t GPUTexture::getWidth() { return _instance.GetWidth(); }

uint32_t GPUTexture::getHeight() { return _instance.GetHeight(); }

uint32_t GPUTexture::getDepthOrArrayLayers() {
  return _instance.GetDepthOrArrayLayers();
}

uint32_t GPUTexture::getMipLevelCount() { return _instance.GetMipLevelCount(); }

uint32_t GPUTexture::getSampleCount() { return _instance.GetSampleCount(); }

wgpu::TextureDimension GPUTexture::getDimension() {
  return _instance.GetDimension();
}

wgpu::TextureFormat GPUTexture::getFormat() { return _instance.GetFormat(); }

double GPUTexture::getUsage() {
  return static_cast<double>(_instance.GetUsage());
}

} // namespace rnwgpu
