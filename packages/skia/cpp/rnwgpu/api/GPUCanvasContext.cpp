#include "GPUCanvasContext.h"
#include "Convertors.h"
#include <algorithm>
#include <memory>
#include <utility>
#include <vector>

namespace rnwgpu {

void GPUCanvasContext::configure(
    std::shared_ptr<GPUCanvasConfiguration> configuration) {
  Convertor conv;
  wgpu::SurfaceConfiguration surfaceConfiguration;
  surfaceConfiguration.device = configuration->device->get();
  if (!conv(surfaceConfiguration.usage, configuration->usage) ||
      !conv(surfaceConfiguration.format, configuration->format)) {
    throw std::runtime_error("Error with SurfaceConfiguration");
  }
  // viewFormats are deep-copied into SurfaceInfo (which outlives this call);
  // Convertor-allocated arrays would dangle.
  std::vector<wgpu::TextureFormat> viewFormats;
  if (configuration->viewFormats.has_value()) {
    viewFormats = configuration->viewFormats.value();
  }

#ifdef __APPLE__
  surfaceConfiguration.alphaMode = configuration->alphaMode;
#endif
  surfaceConfiguration.presentMode = wgpu::PresentMode::Fifo;
  _surfaceInfo->configure(surfaceConfiguration, std::move(viewFormats));
}

void GPUCanvasContext::unconfigure() { _surfaceInfo->unconfigure(); }

std::shared_ptr<GPUTexture> GPUCanvasContext::getCurrentTexture() {
  if (!_surfaceInfo->isConfigured()) {
    // Web parity: on the web this is an InvalidStateError, not a crash.
    throw std::runtime_error(
        "[WebGPU] getCurrentTexture() called on a canvas context that is not "
        "configured; call context.configure() first");
  }
  // The drawing buffer tracks canvas.width/height (like on the web); resize it
  // lazily when they changed. Sizes are clamped to 1 so a canvas that has not
  // been laid out yet (0x0) keeps working.
  auto prevSize = _surfaceInfo->getConfig();
  auto width = std::max(1, _canvas->getWidth());
  auto height = std::max(1, _canvas->getHeight());
  auto sizeHasChanged = prevSize.width != static_cast<uint32_t>(width) ||
                        prevSize.height != static_cast<uint32_t>(height);
  if (sizeHasChanged) {
    _surfaceInfo->reconfigure(width, height);
  }

  auto texture = _surfaceInfo->getCurrentTexture();
  if (texture == nullptr) {
    throw std::runtime_error(
        "[WebGPU] getCurrentTexture() failed to acquire a texture");
  }

  auto size = _surfaceInfo->getSize();
  _canvas->setClientWidth(size.width);
  _canvas->setClientHeight(size.height);

  return std::make_shared<GPUTexture>(texture, "", false);
}

void GPUCanvasContext::present() {
  // presentFrame() is the end-of-frame boundary: it presents when this frame's
  // texture was acquired from the on-screen surface (offscreen and dropped
  // frames are skipped), clears the frame state, and adopts any surface that
  // attached while the frame was in flight.
  _surfaceInfo->presentFrame();
}

} // namespace rnwgpu
