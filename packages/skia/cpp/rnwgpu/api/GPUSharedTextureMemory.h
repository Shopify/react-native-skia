#pragma once

#include <cstdint>
#include <memory>
#include <optional>
#include <string>
#include <vector>

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

#include "GPUSharedFence.h"
#include "GPUTexture.h"
#include "descriptors/GPUSharedFenceState.h"
#include "descriptors/GPUTextureDescriptor.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUSharedTextureMemory : public NativeObject<GPUSharedTextureMemory> {
public:
  static constexpr const char *CLASS_NAME = "GPUSharedTextureMemory";

  explicit GPUSharedTextureMemory(wgpu::SharedTextureMemory instance,
                                  std::string label)
      : NativeObject(CLASS_NAME), _instance(std::move(instance)),
        _label(std::move(label)) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  std::shared_ptr<GPUTexture> createTexture(
      std::optional<std::shared_ptr<GPUTextureDescriptor>> descriptor);

  // Optional `fences` are wait fences: Dawn waits for each to reach its
  // signaledValue before writing the surface. Throws on failure.
  void beginAccess(
      std::shared_ptr<GPUTexture> texture, bool initialized,
      std::optional<std::vector<std::shared_ptr<GPUSharedFenceState>>> fences);

  // endAccess(texture) -> { initialized, fences: { fence, signaledValue }[] }
  // Surfaces the fences Dawn produced for the access. Throws on failure.
  jsi::Value endAccess(jsi::Runtime &runtime, const jsi::Value &thisVal,
                       const jsi::Value *args, size_t count);

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand",
                  &GPUSharedTextureMemory::getBrand);
    installMethod(runtime, prototype, "createTexture",
                  &GPUSharedTextureMemory::createTexture);
    installMethod(runtime, prototype, "beginAccess",
                  &GPUSharedTextureMemory::beginAccess);
    installMethod(runtime, prototype, "endAccess",
                  &GPUSharedTextureMemory::endAccess);
    installGetterSetter(runtime, prototype, "label",
                        &GPUSharedTextureMemory::getLabel,
                        &GPUSharedTextureMemory::setLabel);
  }

  inline const wgpu::SharedTextureMemory get() { return _instance; }

private:
  wgpu::SharedTextureMemory _instance;
  std::string _label;
};

} // namespace rnwgpu
