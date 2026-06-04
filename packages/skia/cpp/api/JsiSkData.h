#pragma once

#include <algorithm>
#include <atomic>
#include <memory>
#include <stdexcept>
#include <string>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "jsi2/NativeObject.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkData.h"
#include "include/core/SkFont.h"
#include "include/core/SkStream.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

/**
 * Migrated from the deprecated jsi::HostObject API to the JSI NativeState
 * pattern (rnwgpu::NativeObject, see cpp/jsi2/NativeObject.h).
 *
 * SkData is a leaf wrapper: it exposes only __typename__ and dispose() to JS.
 * Consumers that need the wrapped sk_sp<SkData> read it back through
 * JsiSkData::fromValue(rt, v)->getObject() (native object), or test for it with
 * value.getObject(rt).hasNativeState<JsiSkData>(rt).
 */
class JsiSkData : public rnwgpu::NativeObject<JsiSkData> {
public:
  static constexpr const char *CLASS_NAME = "Data";

  JsiSkData(std::shared_ptr<RNSkPlatformContext> context, sk_sp<SkData> data)
      : rnwgpu::NativeObject<JsiSkData>(CLASS_NAME), _context(std::move(context)),
        _object(std::move(data)) {}

  std::string getTypename() { return CLASS_NAME; }

  size_t getMemoryPressure() override {
    return _object ? std::max(_object->size(), rnwgpu::kMinMemoryPressure)
                   : rnwgpu::kMinMemoryPressure;
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__typename__", &JsiSkData::getTypename);
    prototype.setProperty(
        runtime, "dispose",
        jsi::Function::createFromHostFunction(
            runtime, jsi::PropNameID::forUtf8(runtime, "dispose"), 0,
            [](jsi::Runtime &rt, const jsi::Value &thisValue,
               const jsi::Value * /*arguments*/,
               size_t /*count*/) -> jsi::Value {
              auto self = JsiSkData::fromValue(rt, thisValue);
              self->release();
              if (thisValue.isObject()) {
                thisValue.getObject(rt).setExternalMemoryPressure(
                    rt, rnwgpu::kMinMemoryPressure);
              }
              return jsi::Value::undefined();
            }));
  }

  /**
   * Returns the wrapped object, throwing if it has been disposed. Mirrors the
   * behaviour of the former JsiSkWrapping* base classes.
   */
  sk_sp<SkData> getObject() const {
    if (_disposed.load(std::memory_order_acquire)) {
      throw std::runtime_error("Attempted to access a disposed object.");
    }
    return _object;
  }

  std::shared_ptr<RNSkPlatformContext> getContext() const { return _context; }

private:
  void release() {
    bool expected = false;
    if (_disposed.compare_exchange_strong(expected, true,
                                          std::memory_order_acq_rel)) {
      _object = nullptr;
    }
  }

  std::shared_ptr<RNSkPlatformContext> _context;
  sk_sp<SkData> _object;
  std::atomic<bool> _disposed = {false};
};
} // namespace RNSkia
