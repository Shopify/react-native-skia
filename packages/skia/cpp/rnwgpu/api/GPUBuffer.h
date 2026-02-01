#pragma once

#include <memory>
#include <optional>
#include <string>
#include <vector>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "rnwgpu/async/AsyncRunner.h"
#include "rnwgpu/async/AsyncTaskHandle.h"

#include "webgpu/webgpu_cpp.h"

#include "ArrayBuffer.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUBuffer : public NativeObject<GPUBuffer> {
public:
  static constexpr const char *CLASS_NAME = "GPUBuffer";

  explicit GPUBuffer(wgpu::Buffer instance,
                     std::shared_ptr<async::AsyncRunner> async,
                     std::string label)
      : NativeObject(CLASS_NAME), _instance(instance), _async(async),
        _label(label) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  async::AsyncTaskHandle mapAsync(uint64_t modeIn,
                                  std::optional<uint64_t> offset,
                                  std::optional<uint64_t> size);
  std::shared_ptr<ArrayBuffer> getMappedRange(std::optional<size_t> offset,
                                              std::optional<size_t> size);
  void unmap();
  void destroy();

  uint64_t getSize();
  double getUsage();
  wgpu::BufferMapState getMapState();

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUBuffer::getBrand);
    installMethod(runtime, prototype, "mapAsync", &GPUBuffer::mapAsync);
    installMethod(runtime, prototype, "getMappedRange",
                  &GPUBuffer::getMappedRange);
    installMethod(runtime, prototype, "unmap", &GPUBuffer::unmap);
    installMethod(runtime, prototype, "destroy", &GPUBuffer::destroy);
    installGetter(runtime, prototype, "size", &GPUBuffer::getSize);
    installGetter(runtime, prototype, "usage", &GPUBuffer::getUsage);
    installGetter(runtime, prototype, "mapState", &GPUBuffer::getMapState);
    installGetterSetter(runtime, prototype, "label", &GPUBuffer::getLabel,
                        &GPUBuffer::setLabel);
  }

  inline const wgpu::Buffer get() { return _instance; }

  size_t getMemoryPressure() override { return static_cast<size_t>(getSize()); }

private:
  wgpu::Buffer _instance;
  std::shared_ptr<async::AsyncRunner> _async;
  std::string _label;
  struct Mapping {
    uint64_t start;
    uint64_t end;
    inline bool Intersects(uint64_t s, uint64_t e) const {
      return s < end && e > start;
    }
    std::shared_ptr<ArrayBuffer> buffer;
  };
  std::vector<Mapping> mappings;
};

} // namespace rnwgpu
