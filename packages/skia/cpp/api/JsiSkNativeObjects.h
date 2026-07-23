#pragma once

#include <atomic>
#include <memory>
#include <string>
#include <utility>

#include <jsi/jsi.h>

#include "jsi/NativeObject.h"
#include "rnskia/RNSkPlatformContext.h"
#include "utils/RNSkLog.h"

#define STR_CAT_NX(A, B) A##B
#define STR_CAT(A, B) STR_CAT_NX(A, B)
#define STR_GET get_
#define STR_SET set_

/**
 * Creates a new Host function declaration as a lambda with all deps passed
 * with implicit lambda capture clause
 */
#define JSI_HOST_FUNCTION_LAMBDA                                               \
  [=](jsi::Runtime & runtime, const jsi::Value &thisValue,                     \
      const jsi::Value *arguments, size_t count) -> jsi::Value

/**
 * Creates a new Host function declaration
 */
#define JSI_HOST_FUNCTION(NAME)                                                \
  jsi::Value NAME(jsi::Runtime &runtime, const jsi::Value &thisValue,          \
                  const jsi::Value *arguments, size_t count)

/**
 * Creates a new property setter function declaration
 */
#define JSI_PROPERTY_SET(NAME)                                                 \
  void STR_CAT(STR_SET, NAME)(jsi::Runtime & runtime, const jsi::Value &value)

/**
 * Creates a new property getter function declaration
 */
#define JSI_PROPERTY_GET(NAME)                                                 \
  jsi::Value STR_CAT(STR_GET, NAME)(jsi::Runtime & runtime)

namespace RNSkia {

namespace jsi = facebook::jsi;

// Minimum memory pressure reported for any native object — aliased from the
// NativeObject infrastructure so dispose() and create() agree on the floor.
static constexpr size_t kMinMemoryPressure = rnwgpu::kMinMemoryPressure;

/**
 * Creates the JS object for a wrapper instance (a class based on the
 * NativeObject pattern below).
 */
template <typename T>
jsi::Value makeJsiObject(jsi::Runtime &runtime, std::shared_ptr<T> instance) {
  return T::create(runtime, std::move(instance));
}

/**
 * Returns the wrapper instance backing the given JS object or nullptr if the
 * object is not backed by the requested type.
 */
template <typename T>
std::shared_ptr<T> tryGetJsiObject(jsi::Runtime &runtime,
                                   const jsi::Object &object) {
  if (object.hasNativeState<T>(runtime)) {
    return object.getNativeState<T>(runtime);
  }
  return nullptr;
}

template <typename T>
std::shared_ptr<T> tryGetJsiObject(jsi::Runtime &runtime,
                                   const jsi::Value &value) {
  if (!value.isObject()) {
    return nullptr;
  }
  auto object = value.asObject(runtime);
  return tryGetJsiObject<T>(runtime, object);
}

/**
 * Returns the wrapper instance backing the given JS value or throws a JS
 * error if the value is not backed by the requested type.
 */
template <typename T>
std::shared_ptr<T> getJsiObject(jsi::Runtime &runtime,
                                const jsi::Value &value) {
  auto result = tryGetJsiObject<T>(runtime, value);
  if (result == nullptr) {
    throw jsi::JSError(runtime, "Expected a Skia object of a different type.");
  }
  return result;
}

/**
 * Base class for Skia API objects implemented with the NativeObject /
 * jsi::NativeState pattern (see jsi/NativeObject.h). Instead of a HostObject
 * intercepting every property access, methods and properties live on a shared
 * per-runtime prototype and the C++ instance is attached to plain JS objects
 * as native state.
 *
 * Derived classes must provide:
 * - `static constexpr const char *CLASS_NAME` — the public __typename__
 *   (e.g. "Rect"); also used as the boxing brand, so it must be unique.
 * - `static void definePrototype(jsi::Runtime&, jsi::Object& prototype)` —
 *   installs methods/getters. The shared pieces (`__typename__`, `__box()`
 *   and the boxing reconstructor) are installed by
 *   NativeObject::installPrototype; wrapping classes additionally call
 *   `installCommon(runtime, proto)` to install dispose().
 *
 * The existing JSI_HOST_FUNCTION / JSI_PROPERTY_GET / JSI_PROPERTY_SET method
 * bodies keep working unchanged; they are installed on the prototype with the
 * installHostMethod / installHostGetter / installHostSetter helpers below,
 * which resolve the C++ instance from `this` via native state.
 */
template <typename Derived>
class JsiSkNativeObject : public rnwgpu::NativeObject<Derived> {
public:
  explicit JsiSkNativeObject(std::shared_ptr<RNSkPlatformContext> context)
      : rnwgpu::NativeObject<Derived>(Derived::CLASS_NAME),
        _context(std::move(context)) {}

  /**
   * Resolves the C++ instance backing `thisValue`. Throws a JSError if the
   * value is not backed by this class.
   */
  static std::shared_ptr<Derived> fromThis(jsi::Runtime &runtime,
                                           const jsi::Value &thisValue) {
    return rnwgpu::NativeObject<Derived>::fromValue(runtime, thisValue);
  }

protected:
  std::shared_ptr<RNSkPlatformContext> getContext() { return _context; }

  /**
   @Returns a reference to the argument at the given position in the arguments
   array. Raises an error if the index is above the number of arguments.
   */
  static const jsi::Value &getArgument(jsi::Runtime &runtime,
                                       const jsi::Value *arguments,
                                       size_t count, size_t index) {
    if (index >= count) {
      throw jsi::JSError(runtime, "Argument index out of bounds.");
    }

    return arguments[index];
  }

  /**
   Returns argument as number or throws
   */
  static double getArgumentAsNumber(jsi::Runtime &runtime,
                                    const jsi::Value *arguments, size_t count,
                                    size_t index) {
    const jsi::Value &value = getArgument(runtime, arguments, count, index);
    if (!value.isNumber()) {
      throw jsi::JSError(runtime,
                         "Expected type number for parameter at index " +
                             std::to_string(index));
    }
    return value.asNumber();
  }

  /**
   Returns argument as string or throws
   */
  static jsi::String getArgumentAsString(jsi::Runtime &runtime,
                                         const jsi::Value *arguments,
                                         size_t count, size_t index) {
    const jsi::Value &value = getArgument(runtime, arguments, count, index);
    if (!value.isString()) {
      throw jsi::JSError(runtime,
                         "Expected type string for parameter at index " +
                             std::to_string(index));
    }
    return value.asString(runtime);
  }

  /**
   Returns argument as object or throws
   */
  static jsi::Object getArgumentAsObject(jsi::Runtime &runtime,
                                         const jsi::Value *arguments,
                                         size_t count, size_t index) {
    const jsi::Value &value = getArgument(runtime, arguments, count, index);
    if (!value.isObject()) {
      throw jsi::JSError(runtime,
                         "Expected type object for parameter at index " +
                             std::to_string(index));
    }
    return value.asObject(runtime);
  }

  /**
   Returns argument as function or throws
   */
  static jsi::Object getArgumentAsFunction(jsi::Runtime &runtime,
                                           const jsi::Value *arguments,
                                           size_t count, size_t index) {
    auto value = getArgumentAsObject(runtime, arguments, count, index);
    if (!value.isFunction(runtime)) {
      throw jsi::JSError(runtime,
                         "Expected type function for parameter at index " +
                             std::to_string(index));
    }
    return value.asFunction(runtime);
  }

  using HostMethod = jsi::Value (Derived::*)(jsi::Runtime &, const jsi::Value &,
                                             const jsi::Value *, size_t);
  using HostGetter = jsi::Value (Derived::*)(jsi::Runtime &);
  using HostSetter = void (Derived::*)(jsi::Runtime &, const jsi::Value &);

  /**
   * Installs a method with the classic host-function signature
   * (JSI_HOST_FUNCTION) on the prototype.
   */
  static void installHostMethod(jsi::Runtime &runtime, jsi::Object &prototype,
                                const char *name, HostMethod method) {
    auto func = jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, name), 0,
        [method](jsi::Runtime &rt, const jsi::Value &thisValue,
                 const jsi::Value *arguments, size_t count) -> jsi::Value {
          auto native = fromThis(rt, thisValue);
          return ((*native).*method)(rt, thisValue, arguments, count);
        });
    prototype.setProperty(runtime, name, func);
  }

  /**
   * Installs a property getter with the classic JSI_PROPERTY_GET signature on
   * the prototype.
   */
  static void installHostGetter(jsi::Runtime &runtime, jsi::Object &prototype,
                                const char *name, HostGetter getter) {
    auto getterFunc = jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, std::string("get_") + name),
        0,
        [getter](jsi::Runtime &rt, const jsi::Value &thisValue,
                 const jsi::Value *, size_t) -> jsi::Value {
          auto native = fromThis(rt, thisValue);
          return ((*native).*getter)(rt);
        });
    defineProperty(runtime, prototype, name, &getterFunc, nullptr);
  }

  /**
   * Installs a property setter with the classic JSI_PROPERTY_SET signature on
   * the prototype, preserving a previously installed getter.
   */
  static void installHostSetter(jsi::Runtime &runtime, jsi::Object &prototype,
                                const char *name, HostSetter setter) {
    auto setterFunc = jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, std::string("set_") + name),
        1,
        [setter](jsi::Runtime &rt, const jsi::Value &thisValue,
                 const jsi::Value *arguments, size_t count) -> jsi::Value {
          if (count < 1) {
            throw jsi::JSError(rt, "Setter requires a value argument");
          }
          auto native = fromThis(rt, thisValue);
          ((*native).*setter)(rt, arguments[0]);
          return jsi::Value::undefined();
        });
    defineProperty(runtime, prototype, name, nullptr, &setterFunc);
  }

  /**
   * Installs both getter and setter for a property on the prototype.
   */
  static void installHostProperty(jsi::Runtime &runtime, jsi::Object &prototype,
                                  const char *name, HostGetter getter,
                                  HostSetter setter) {
    installHostGetter(runtime, prototype, name, getter);
    installHostSetter(runtime, prototype, name, setter);
  }

  /**
   * Installs a typed mutating method that returns `this` for chaining
   * (e.g. path.moveTo(...).lineTo(...)). Arguments are converted through
   * rnwgpu::JSIConverter like installMethod; the member function's return
   * value (if any) is ignored and the JS function returns thisValue.
   */
  template <typename ReturnType, typename... Args>
  static void installChainableMethod(jsi::Runtime &runtime,
                                     jsi::Object &prototype, const char *name,
                                     ReturnType (Derived::*method)(Args...)) {
    auto func = jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, name), sizeof...(Args),
        [method](jsi::Runtime &rt, const jsi::Value &thisValue,
                 const jsi::Value *args, size_t count) -> jsi::Value {
          auto native = fromThis(rt, thisValue);
          invokeChainable(native.get(), method, rt, args,
                          std::index_sequence_for<Args...>{}, count);
          return jsi::Value(rt, thisValue);
        });
    prototype.setProperty(runtime, name, func);
  }

  /**
   * Chainable variant for methods that need the calling jsi::Runtime as
   * their first parameter (e.g. the deprecated SkPath mutators, which log a
   * warning to the JS console).
   */
  template <typename ReturnType, typename... Args>
  static void installChainableMethodWithRuntime(
      jsi::Runtime &runtime, jsi::Object &prototype, const char *name,
      ReturnType (Derived::*method)(jsi::Runtime &, Args...)) {
    auto func = jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, name), sizeof...(Args),
        [method](jsi::Runtime &rt, const jsi::Value &thisValue,
                 const jsi::Value *args, size_t count) -> jsi::Value {
          auto native = fromThis(rt, thisValue);
          invokeChainableWithRuntime(native.get(), method, rt, args,
                                     std::index_sequence_for<Args...>{}, count);
          return jsi::Value(rt, thisValue);
        });
    prototype.setProperty(runtime, name, func);
  }

private:
  // Invokes a typed member function with JSI argument conversion, discarding
  // the result. Used by installChainableMethod, which returns thisValue.
  template <typename ReturnType, typename... Args, size_t... Is>
  static void invokeChainable(Derived *obj,
                              ReturnType (Derived::*method)(Args...),
                              jsi::Runtime &runtime, const jsi::Value *args,
                              std::index_sequence<Is...>, size_t count) {
    (obj->*method)(rnwgpu::JSIConverter<std::decay_t<Args>>::fromJSI(
        runtime, args[Is], Is >= count)...);
  }

  template <typename ReturnType, typename... Args, size_t... Is>
  static void invokeChainableWithRuntime(
      Derived *obj, ReturnType (Derived::*method)(jsi::Runtime &, Args...),
      jsi::Runtime &runtime, const jsi::Value *args, std::index_sequence<Is...>,
      size_t count) {
    (obj->*method)(runtime,
                   rnwgpu::JSIConverter<std::decay_t<Args>>::fromJSI(
                       runtime, args[Is], Is >= count)...);
  }

  static void defineProperty(jsi::Runtime &runtime, jsi::Object &prototype,
                             const char *name, jsi::Function *getter,
                             jsi::Function *setter) {
    auto objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
    auto defineProp =
        objectCtor.getPropertyAsFunction(runtime, "defineProperty");
    auto getOwnPropertyDescriptor =
        objectCtor.getPropertyAsFunction(runtime, "getOwnPropertyDescriptor");
    auto existing = getOwnPropertyDescriptor.call(
        runtime, prototype, jsi::String::createFromUtf8(runtime, name));

    jsi::Object descriptor(runtime);
    if (existing.isObject()) {
      auto existingObj = existing.getObject(runtime);
      if (existingObj.hasProperty(runtime, "get")) {
        descriptor.setProperty(runtime, "get",
                               existingObj.getProperty(runtime, "get"));
      }
      if (existingObj.hasProperty(runtime, "set")) {
        descriptor.setProperty(runtime, "set",
                               existingObj.getProperty(runtime, "set"));
      }
    }
    if (getter != nullptr) {
      descriptor.setProperty(runtime, "get", *getter);
    }
    if (setter != nullptr) {
      descriptor.setProperty(runtime, "set", *setter);
    }
    descriptor.setProperty(runtime, "enumerable", true);
    descriptor.setProperty(runtime, "configurable", true);
    defineProp.call(runtime, prototype,
                    jsi::String::createFromUtf8(runtime, name), descriptor);
  }

  std::shared_ptr<RNSkPlatformContext> _context;
};

/**
 * NativeObject equivalent of JsiSkWrappingHostObject: wraps an inner object
 * (a std::shared_ptr or sk_sp) and provides dispose() semantics.
 */
template <typename Derived, typename T>
class JsiSkWrappingNativeObject : public JsiSkNativeObject<Derived> {
public:
  JsiSkWrappingNativeObject(std::shared_ptr<RNSkPlatformContext> context,
                            T object)
      : JsiSkNativeObject<Derived>(std::move(context)),
        _object(std::move(object)) {}

  /**
   * Returns the wrapped object. Throws if the object has been disposed.
   */
  T getObject() { return validateObject(); }
  const T getObject() const { return validateObject(); }

  /**
   * Updates the inner object with a new version of the object.
   */
  void setObject(T object) { _object = object; }

  /**
   * Returns the wrapped object from a JS value backed by this class.
   */
  static T objectFromValue(jsi::Runtime &runtime, const jsi::Value &value) {
    return JsiSkNativeObject<Derived>::fromThis(runtime, value)->getObject();
  }

  /**
   * dispose() releases the wrapped resources eagerly instead of waiting for
   * garbage collection. Installed on the prototype via installCommon.
   */
  JSI_HOST_FUNCTION(dispose) {
    if (!isDisposed()) {
      thisValue.asObject(runtime).setExternalMemoryPressure(runtime,
                                                            kMinMemoryPressure);
    }
    safeDispose();
    return jsi::Value::undefined();
  }

  /**
   * Installs dispose() on the prototype (the shared pieces — __typename__,
   * __box() and the boxing reconstructor — are installed by
   * NativeObject::installPrototype). Must be called from definePrototype().
   */
  static void installCommon(jsi::Runtime &runtime, jsi::Object &prototype) {
    JsiSkNativeObject<Derived>::installHostMethod(runtime, prototype, "dispose",
                                                  &Derived::dispose);
  }

protected:
  /**
   * Override to release additional resources. Called exactly once.
   */
  virtual void releaseResources() { setObject(nullptr); }

  bool isDisposed() const {
    return _isDisposed.load(std::memory_order_acquire);
  }

  /**
   * Returns the wrapped object without the disposed check — for destructors
   * and releaseResources() implementations.
   */
  T getObjectUnchecked() const { return _object; }

private:
  T validateObject() const {
    if (_isDisposed.load(std::memory_order_acquire)) {
      throw std::runtime_error("Attempted to access a disposed object.");
    }
    return _object;
  }

  void safeDispose() {
    bool expected = false;
    if (_isDisposed.compare_exchange_strong(expected, true,
                                            std::memory_order_acq_rel)) {
      releaseResources();
    }
  }

  T _object;
  std::atomic<bool> _isDisposed = {false};
};

template <typename Derived, typename T>
using JsiSkWrappingSharedPtrNativeObject =
    JsiSkWrappingNativeObject<Derived, std::shared_ptr<T>>;

template <typename Derived, typename T>
using JsiSkWrappingSkPtrNativeObject =
    JsiSkWrappingNativeObject<Derived, sk_sp<T>>;

} // namespace RNSkia
