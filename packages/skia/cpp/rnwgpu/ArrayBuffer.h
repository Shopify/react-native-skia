#pragma once
#include <jsi/jsi.h>

#include <cmath>
#include <cstdint>
#include <memory>

#include "jsi2/JSIConverter.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

struct ArrayBuffer : jsi::MutableBuffer {
  ArrayBuffer(void *data, size_t size, size_t bytesPerElement)
      : _data(data), _size(size), _bytesPerElement(bytesPerElement) {}

  ~ArrayBuffer() override {}

  size_t size() const override { return _size; }

  uint8_t *data() override { return static_cast<uint8_t *>(_data); }

  void *_data;
  size_t _size;
  size_t _bytesPerElement;
};

static std::shared_ptr<ArrayBuffer>
createArrayBufferFromJSI(jsi::Runtime &runtime,
                         const jsi::ArrayBuffer &arrayBuffer,
                         size_t bytesPerElement) {
  auto size = arrayBuffer.size(runtime);
  return std::make_shared<ArrayBuffer>(arrayBuffer.data(runtime), size,
                                       bytesPerElement);
}

template <> struct JSIConverter<std::shared_ptr<ArrayBuffer>> {
  static std::shared_ptr<ArrayBuffer>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBound) {
    if (arg.isObject()) {
      auto obj = arg.getObject(runtime);
      if (obj.isArrayBuffer(runtime)) {
        return createArrayBufferFromJSI(runtime, obj.getArrayBuffer(runtime),
                                        1);
      }
      if (obj.hasProperty(runtime, "buffer")) {
        auto bufferProp = obj.getProperty(runtime, "buffer");
        if (bufferProp.isObject() &&
            bufferProp.getObject(runtime).isArrayBuffer(runtime)) {
          auto buff = bufferProp.getObject(runtime);
          auto arrayBuffer = buff.getArrayBuffer(runtime);
          const size_t bufferSize = arrayBuffer.size(runtime);

          // byteOffset / byteLength are user-readable JS properties, not values
          // the engine guarantees (unlike Dawn's node binding, which reads them
          // off the engine's typed-array view). Read them as doubles so we can
          // reject negative, non-integral, NaN/Inf, or oversized values before
          // they wrap around when cast to size_t.
          const double byteOffsetValue =
              obj.getProperty(runtime, "byteOffset").asNumber();
          const double byteLengthValue =
              obj.getProperty(runtime, "byteLength").asNumber();

          auto isValidByteIndex = [](double value) {
            return std::isfinite(value) && value >= 0.0 &&
                   value <= static_cast<double>(SIZE_MAX) &&
                   std::floor(value) == value;
          };
          if (!isValidByteIndex(byteOffsetValue) ||
              !isValidByteIndex(byteLengthValue)) {
            throw std::runtime_error(
                "ArrayBuffer::fromJSI: invalid byteOffset/byteLength");
          }

          const size_t byteOffset = static_cast<size_t>(byteOffsetValue);
          const size_t byteLength = static_cast<size_t>(byteLengthValue);

          // Overflow-safe bounds check: byteOffset + byteLength <= bufferSize.
          if (byteOffset > bufferSize ||
              byteLength > bufferSize - byteOffset) {
            throw std::runtime_error(
                "ArrayBuffer::fromJSI: view bounds [byteOffset, byteOffset + "
                "byteLength) exceed the backing ArrayBuffer size");
          }

          // BYTES_PER_ELEMENT is absent on a DataView; default to 1. A spoofed
          // object could report 0 (or a negative/NaN value), so clamp to a
          // minimum of 1 to avoid a later division by zero in writeBuffer.
          size_t bytesPerElements = 1;
          if (obj.hasProperty(runtime, "BYTES_PER_ELEMENT")) {
            auto bpe = obj.getProperty(runtime, "BYTES_PER_ELEMENT");
            if (bpe.isNumber()) {
              const double value = bpe.asNumber();
              if (std::isfinite(value) && value >= 1.0) {
                bytesPerElements = static_cast<size_t>(value);
              }
            }
          }

          return std::make_shared<ArrayBuffer>(
              arrayBuffer.data(runtime) + byteOffset, byteLength,
              bytesPerElements);
        }
      }
    }
    throw std::runtime_error("ArrayBuffer::fromJSI: argument is not an object "
                             "with an ArrayBuffer 'buffer' property");
  }

  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<ArrayBuffer> arg) {
    return jsi::ArrayBuffer(runtime, arg);
  }
};

} // namespace rnwgpu
