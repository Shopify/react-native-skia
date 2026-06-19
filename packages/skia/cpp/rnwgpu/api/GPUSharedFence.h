#pragma once

#include <memory>
#include <string>

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

// Wraps a wgpu::SharedFence: a native GPU sync primitive (id<MTLSharedEvent> on
// Apple, sync-fd / VkSemaphore on Android).
class GPUSharedFence : public NativeObject<GPUSharedFence> {
public:
  static constexpr const char *CLASS_NAME = "GPUSharedFence";

  explicit GPUSharedFence(wgpu::SharedFence instance, std::string label)
      : NativeObject(CLASS_NAME), _instance(std::move(instance)),
        _label(std::move(label)) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  // export() -> { type, handle }: exposes the native handle (as a BigInt) so
  // app code can wait on or signal the fence. The caller owns the returned
  // handle (e.g. an exported sync-fd must be close()d).
  jsi::Value exportInfo(jsi::Runtime &runtime, const jsi::Value &thisVal,
                        const jsi::Value *args, size_t count);

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUSharedFence::getBrand);
    installMethod(runtime, prototype, "export", &GPUSharedFence::exportInfo);
    installGetterSetter(runtime, prototype, "label", &GPUSharedFence::getLabel,
                        &GPUSharedFence::setLabel);
  }

  inline wgpu::SharedFence get() { return _instance; }

private:
  wgpu::SharedFence _instance;
  std::string _label;
};

} // namespace rnwgpu
