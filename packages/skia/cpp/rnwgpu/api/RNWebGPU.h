#pragma once

#include <memory>
#include <string>

#include "jsi2/NativeObject.h"

#include "GPU.h"
#include "GPUCanvasContext.h"
#include "rnwgpu/Canvas.h"
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

  // Retires a canvas context from the JS side (Canvas unmount cleanup).
  // Registry entries have two owners, split by whether a native surface is
  // attached:
  // - A native view currently owns a surface (or one is pending): its own
  //   teardown (WebGPUMetalView dealloc / WebGPUViewManager.onDropViewInstance)
  //   removes the entry. Skipping here keeps React StrictMode safe: its
  //   simulated unmount re-runs JS effects without unmounting native views,
  //   and removing the entry then would orphan the still-attached surface.
  // - No native surface: the JS side is the last owner and removes the entry.
  // The check-and-erase runs atomically under the registry lock
  // (removeSurfaceInfoIfDetached), serialized against the UI thread's
  // find-or-create + attach (SurfaceRegistry::attachSurface), so a concurrent
  // attach can never be orphaned by this removal.
  void destroyContext(int contextId) {
    auto &registry = rnwgpu::SurfaceRegistry::getInstance();
    registry.removeSurfaceInfoIfDetached(contextId);
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "fabric", &RNWebGPU::getFabric);
    installGetter(runtime, prototype, "gpu", &RNWebGPU::getGPU);
    installMethod(runtime, prototype, "getNativeSurface",
                  &RNWebGPU::getNativeSurface);
    installMethod(runtime, prototype, "destroyContext",
                  &RNWebGPU::destroyContext);
    installMethod(runtime, prototype, "MakeWebGPUCanvasContext",
                  &RNWebGPU::MakeWebGPUCanvasContext);
  }

private:
  std::shared_ptr<GPU> _gpu;
  std::shared_ptr<PlatformContext> _platformContext;
};

} // namespace rnwgpu
