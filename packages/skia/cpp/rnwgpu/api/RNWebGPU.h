#pragma once

#include <memory>
#include <string>

#include "jsi2/NativeObject.h"

#include "rnwgpu/Canvas.h"
#include "GPU.h"
#include "GPUCanvasContext.h"
#include "rnwgpu/PlatformContext.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class RNWebGPU : public NativeObject<RNWebGPU> {
public:
  static constexpr const char *CLASS_NAME = "RNWebGPU";

  explicit RNWebGPU(std::shared_ptr<GPU> gpu,
                    std::shared_ptr<PlatformContext> platformContext)
      : NativeObject(CLASS_NAME), _gpu(gpu), _platformContext(platformContext) {
  }

  std::shared_ptr<GPU> getGPU() { return _gpu; }

  bool getFabric() { return true; }

  std::shared_ptr<GPUCanvasContext>
  MakeWebGPUCanvasContext(int contextId, float width, float height) {
    auto ctx =
        std::make_shared<GPUCanvasContext>(_gpu, contextId, width, height);
    return ctx;
  }

  std::shared_ptr<Canvas> getNativeSurface(int contextId) {
    auto &registry = rnwgpu::SurfaceRegistry::getInstance();
    auto info = registry.getSurfaceInfo(contextId);
    if (info == nullptr) {
      return std::make_shared<Canvas>(nullptr, 0, 0);
    }
    auto nativeInfo = info->getNativeInfo();
    return std::make_shared<Canvas>(nativeInfo.nativeSurface, nativeInfo.width,
                                    nativeInfo.height);
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "fabric", &RNWebGPU::getFabric);
    installGetter(runtime, prototype, "gpu", &RNWebGPU::getGPU);
    installMethod(runtime, prototype, "getNativeSurface",
                  &RNWebGPU::getNativeSurface);
    installMethod(runtime, prototype, "MakeWebGPUCanvasContext",
                  &RNWebGPU::MakeWebGPUCanvasContext);
  }

private:
  std::shared_ptr<GPU> _gpu;
  std::shared_ptr<PlatformContext> _platformContext;
};

} // namespace rnwgpu
