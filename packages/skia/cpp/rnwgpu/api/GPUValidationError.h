#pragma once

#include <string>

#include "jsi2/NativeObject.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUValidationError : public NativeObject<GPUValidationError> {
public:
  static constexpr const char *CLASS_NAME = "GPUValidationError";

  explicit GPUValidationError(std::string message)
      : NativeObject(CLASS_NAME), _message(std::move(message)) {}

public:
  std::string getBrand() { return CLASS_NAME; }
  std::string getMessage() { return _message; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUValidationError::getBrand);
    installGetter(runtime, prototype, "message",
                  &GPUValidationError::getMessage);
  }

private:
  std::string _message;
};

} // namespace rnwgpu
