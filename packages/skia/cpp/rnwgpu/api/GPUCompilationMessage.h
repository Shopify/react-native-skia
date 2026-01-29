#pragma once

#include <string>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUCompilationMessage : public NativeObject<GPUCompilationMessage> {
public:
  static constexpr const char *CLASS_NAME = "GPUCompilationMessage";

  explicit GPUCompilationMessage(wgpu::CompilationMessage instance)
      : NativeObject(CLASS_NAME), _instance(instance) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand",
                  &GPUCompilationMessage::getBrand);
  }

  inline const wgpu::CompilationMessage get() { return _instance; }

private:
  wgpu::CompilationMessage _instance;
};

} // namespace rnwgpu
