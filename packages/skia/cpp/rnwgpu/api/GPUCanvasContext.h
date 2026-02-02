#pragma once

#include <memory>
#include <string>
#include <utility>

#include "descriptors/Unions.h"

#include "webgpu/webgpu_cpp.h"

#include "jsi2/NativeObject.h"

#include "rnwgpu/Canvas.h"
#include "GPU.h"
#include "descriptors/GPUCanvasConfiguration.h"
#include "GPUTexture.h"
#include "rnwgpu/SurfaceRegistry.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUCanvasContext : public NativeObject<GPUCanvasContext> {
public:
  static constexpr const char *CLASS_NAME = "GPUCanvasContext";

  GPUCanvasContext(std::shared_ptr<GPU> gpu, int contextId, int width,
                   int height)
      : NativeObject(CLASS_NAME), _gpu(std::move(gpu)) {
    _canvas = std::make_shared<Canvas>(nullptr, width, height);
    auto &registry = rnwgpu::SurfaceRegistry::getInstance();
    _surfaceInfo =
        registry.getSurfaceInfoOrCreate(contextId, _gpu->get(), width, height);
  }

public:
  std::string getBrand() { return CLASS_NAME; }

  std::shared_ptr<Canvas> getCanvas() { return _canvas; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUCanvasContext::getBrand);
    installGetter(runtime, prototype, "canvas", &GPUCanvasContext::getCanvas);
    installMethod(runtime, prototype, "configure",
                  &GPUCanvasContext::configure);
    installMethod(runtime, prototype, "unconfigure",
                  &GPUCanvasContext::unconfigure);
    installMethod(runtime, prototype, "getCurrentTexture",
                  &GPUCanvasContext::getCurrentTexture);
    installMethod(runtime, prototype, "present", &GPUCanvasContext::present);
  }

  inline const wgpu::Surface get() { return nullptr; }
  void configure(std::shared_ptr<GPUCanvasConfiguration> configuration);
  void unconfigure();
  std::shared_ptr<GPUTexture> getCurrentTexture();
  void present();

private:
  std::shared_ptr<Canvas> _canvas;
  std::shared_ptr<SurfaceInfo> _surfaceInfo;
  std::shared_ptr<GPU> _gpu;
};

} // namespace rnwgpu
