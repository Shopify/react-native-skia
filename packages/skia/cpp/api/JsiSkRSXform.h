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

#include "include/core/SkRSXform.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

/**
 * Migrated from the deprecated jsi::HostObject API to the JSI NativeState
 * pattern (rnwgpu::NativeObject, see cpp/jsi2/NativeObject.h).
 *
 * RSXform is a value type: the JS API may pass either a native RSXform object
 * or a plain { scos, ssin, tx, ty } literal. Because NativeObject::fromValue()
 * throws when the native state is absent, the plain-object fallback lives in a
 * dedicated static helper, toRSXform(), which every consumer uses instead of
 * fromValue().
 */
class JsiSkRSXform : public rnwgpu::NativeObject<JsiSkRSXform> {
public:
  static constexpr const char *CLASS_NAME = "RSXform";

  JsiSkRSXform(std::shared_ptr<RNSkPlatformContext> context,
               const SkRSXform &rsxform)
      : rnwgpu::NativeObject<JsiSkRSXform>(CLASS_NAME),
        _context(std::move(context)),
        _object(std::make_shared<SkRSXform>(rsxform)) {}

  std::string getTypename() { return CLASS_NAME; }

  double getScos() { return SkScalarToDouble(getObject()->fSCos); }
  double getSsin() { return SkScalarToDouble(getObject()->fSSin); }
  double getTx() { return SkScalarToDouble(getObject()->fTx); }
  double getTy() { return SkScalarToDouble(getObject()->fTy); }

  // Returns jsi::Value so it keeps full control of its arguments (installed via
  // installMethod, which forwards arguments/count for jsi::Value methods).
  JSI_HOST_FUNCTION(set) {
    auto scos = arguments[0].asNumber();
    auto ssin = arguments[1].asNumber();
    auto tx = arguments[2].asNumber();
    auto ty = arguments[3].asNumber();
    getObject()->set(scos, ssin, tx, ty);
    return jsi::Value::undefined();
  }

  size_t getMemoryPressure() override {
    return std::max(sizeof(SkRSXform), rnwgpu::kMinMemoryPressure);
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__typename__",
                  &JsiSkRSXform::getTypename);
    installGetter(runtime, prototype, "scos", &JsiSkRSXform::getScos);
    installGetter(runtime, prototype, "ssin", &JsiSkRSXform::getSsin);
    installGetter(runtime, prototype, "tx", &JsiSkRSXform::getTx);
    installGetter(runtime, prototype, "ty", &JsiSkRSXform::getTy);
    installMethod(runtime, prototype, "set", &JsiSkRSXform::set);
    prototype.setProperty(
        runtime, "dispose",
        jsi::Function::createFromHostFunction(
            runtime, jsi::PropNameID::forUtf8(runtime, "dispose"), 0,
            [](jsi::Runtime &rt, const jsi::Value &thisValue,
               const jsi::Value * /*arguments*/,
               size_t /*count*/) -> jsi::Value {
              auto self = JsiSkRSXform::fromValue(rt, thisValue);
              self->release();
              if (thisValue.isObject()) {
                thisValue.getObject(rt).setExternalMemoryPressure(
                    rt, rnwgpu::kMinMemoryPressure);
              }
              return jsi::Value::undefined();
            }));
  }

  /**
   * Returns the wrapped SkRSXform from a JS value. Accepts either a migrated
   * RSXform native object or a plain { scos, ssin, tx, ty } object. This
   * replaces the former HostObject fromValue() (whose name is now reserved by
   * NativeObject for returning the wrapper itself).
   */
  static std::shared_ptr<SkRSXform> toRSXform(jsi::Runtime &runtime,
                                              const jsi::Value &value) {
    const auto &object = value.asObject(runtime);
    if (object.hasNativeState<JsiSkRSXform>(runtime)) {
      return object.getNativeState<JsiSkRSXform>(runtime)->getObject();
    }
    auto scos = object.getProperty(runtime, "scos").asNumber();
    auto ssin = object.getProperty(runtime, "ssin").asNumber();
    auto tx = object.getProperty(runtime, "tx").asNumber();
    auto ty = object.getProperty(runtime, "ty").asNumber();
    return std::make_shared<SkRSXform>(SkRSXform::Make(scos, ssin, tx, ty));
  }

  /**
   * Returns the JS value wrapping an SkRSXform.
   */
  static jsi::Value toValue(jsi::Runtime &runtime,
                            std::shared_ptr<RNSkPlatformContext> context,
                            const SkRSXform &rsxform) {
    return JsiSkRSXform::create(
        runtime, std::make_shared<JsiSkRSXform>(std::move(context), rsxform));
  }

  /**
   * Creates the function for constructing a new instance of the SkRSXform
   * wrapper from radians. Installed in JsiSkApi as "RSXformFromRadians".
   */
  static const jsi::HostFunctionType
  createCtorFromRadians(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      auto rsxform = SkRSXform::MakeFromRadians(
          arguments[0].asNumber(), arguments[1].asNumber(),
          arguments[2].asNumber(), arguments[3].asNumber(),
          arguments[4].asNumber(), arguments[5].asNumber());
      return JsiSkRSXform::create(
          runtime, std::make_shared<JsiSkRSXform>(context, std::move(rsxform)));
    };
  }

  /**
   * Creates the function for constructing a new instance of the SkRSXform
   * wrapper. Installed in JsiSkApi as "RSXform".
   */
  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      auto rsxform =
          SkRSXform::Make(arguments[0].asNumber(), arguments[1].asNumber(),
                          arguments[2].asNumber(), arguments[3].asNumber());
      return JsiSkRSXform::create(
          runtime, std::make_shared<JsiSkRSXform>(context, std::move(rsxform)));
    };
  }

  std::shared_ptr<SkRSXform> getObject() const {
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
  std::shared_ptr<SkRSXform> _object;
  std::atomic<bool> _disposed = {false};
};
} // namespace RNSkia
