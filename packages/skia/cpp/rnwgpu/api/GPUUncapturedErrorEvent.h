#pragma once

#include <memory>
#include <string>
#include <variant>

#include "jsi2/NativeObject.h"

#include "GPUError.h"
#include "GPUInternalError.h"
#include "GPUOutOfMemoryError.h"
#include "GPUValidationError.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

using GPUErrorVariant =
    std::variant<std::shared_ptr<GPUValidationError>,
                 std::shared_ptr<GPUOutOfMemoryError>,
                 std::shared_ptr<GPUInternalError>>;

class GPUUncapturedErrorEvent : public NativeObject<GPUUncapturedErrorEvent> {
public:
  static constexpr const char *CLASS_NAME = "GPUUncapturedErrorEvent";

  explicit GPUUncapturedErrorEvent(GPUErrorVariant error)
      : NativeObject(CLASS_NAME), _error(std::move(error)) {}

  GPUErrorVariant getError() { return _error; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "error",
                  &GPUUncapturedErrorEvent::getError);
  }

private:
  GPUErrorVariant _error;
};

} // namespace rnwgpu

namespace rnwgpu {

template <> struct JSIConverter<GPUErrorVariant> {
  static jsi::Value toJSI(jsi::Runtime &runtime, GPUErrorVariant arg) {
    return std::visit(
        [&runtime](auto &&error) -> jsi::Value {
          using T = std::decay_t<decltype(error)>;
          return JSIConverter<T>::toJSI(runtime, error);
        },
        arg);
  }

  static GPUErrorVariant fromJSI(jsi::Runtime &runtime, const jsi::Value &arg,
                                 bool outOfBounds) {
    throw std::runtime_error("GPUErrorVariant::fromJSI not implemented");
  }
};

} // namespace rnwgpu
