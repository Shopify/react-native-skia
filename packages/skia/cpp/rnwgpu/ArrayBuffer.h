#pragma once
#include <jsi/jsi.h>

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
          auto bytesPerElements =
              obj.getProperty(runtime, "BYTES_PER_ELEMENT").asNumber();
          return createArrayBufferFromJSI(
              runtime, buff.getArrayBuffer(runtime),
              static_cast<size_t>(bytesPerElements));
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
