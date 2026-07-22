#pragma once

#include <atomic>
#include <functional>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "NativeObject.h"
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

// Minimum memory pressure reported for any native object.
// This accounts for C++ wrapper overhead and ensures dispose() never
// increases reported memory pressure (which would defeat its purpose).
static constexpr size_t kMinMemoryPressure = 256;

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
 * Registry mapping a class brand (CLASS_NAME) to a reconstructor that can
 * recreate a fully functional JS object (prototype + native state) on any
 * runtime. This is what enables Skia objects to travel between the React
 * Native runtime and secondary runtimes (Reanimated worklets) via
 * JsiSkBoxedObject.
 */
class JsiSkObjectRegistry {
public:
  using Reconstructor = std::function<jsi::Value(
      jsi::Runtime &, std::shared_ptr<jsi::NativeState>)>;

  static JsiSkObjectRegistry &getInstance() {
    static JsiSkObjectRegistry instance;
    return instance;
  }

  void registerClass(const std::string &brand, Reconstructor reconstructor) {
    std::lock_guard<std::mutex> lock(_mutex);
    _reconstructors[brand] = std::move(reconstructor);
  }

  jsi::Value reconstruct(jsi::Runtime &runtime, const std::string &brand,
                         std::shared_ptr<jsi::NativeState> state) {
    Reconstructor reconstructor;
    {
      std::lock_guard<std::mutex> lock(_mutex);
      auto it = _reconstructors.find(brand);
      if (it == _reconstructors.end()) {
        throw jsi::JSError(runtime,
                           "No Skia class registered for brand: " + brand);
      }
      reconstructor = it->second;
    }
    return reconstructor(runtime, std::move(state));
  }

private:
  JsiSkObjectRegistry() = default;
  std::mutex _mutex;
  std::unordered_map<std::string, Reconstructor> _reconstructors;
};

/**
 * HostObject bridge used to move Skia NativeObjects between runtimes.
 *
 * NativeObject-based values are plain JS objects carrying jsi::NativeState;
 * worklets cannot serialize their prototype, so they are "boxed" into this
 * HostObject (which worklets pass across runtimes by reference) and unboxed
 * on the target runtime, where the prototype is re-installed from the class
 * registry. See registerCustomSerializable in src/skia/SkiaSerializable.ts.
 */
class JsiSkBoxedObject : public jsi::HostObject {
public:
  JsiSkBoxedObject(std::shared_ptr<jsi::NativeState> state, std::string brand)
      : _state(std::move(state)), _brand(std::move(brand)) {}

  jsi::Value get(jsi::Runtime &runtime, const jsi::PropNameID &name) override {
    auto propName = name.utf8(runtime);
    if (propName == "unbox") {
      auto state = _state;
      auto brand = _brand;
      return jsi::Function::createFromHostFunction(
          runtime, jsi::PropNameID::forUtf8(runtime, "unbox"), 0,
          [state, brand](jsi::Runtime &rt, const jsi::Value &,
                         const jsi::Value *, size_t) -> jsi::Value {
            return JsiSkObjectRegistry::getInstance().reconstruct(rt, brand,
                                                                  state);
          });
    }
    if (propName == "__boxedSkiaObject") {
      return jsi::Value(true);
    }
    if (propName == "__brand") {
      return jsi::String::createFromUtf8(runtime, _brand);
    }
    return jsi::Value::undefined();
  }

  void set(jsi::Runtime &runtime, const jsi::PropNameID &,
           const jsi::Value &) override {
    throw jsi::JSError(runtime, "Boxed Skia objects are read-only");
  }

  std::vector<jsi::PropNameID> getPropertyNames(jsi::Runtime &rt) override {
    std::vector<jsi::PropNameID> names;
    names.reserve(3);
    names.push_back(jsi::PropNameID::forUtf8(rt, "unbox"));
    names.push_back(jsi::PropNameID::forUtf8(rt, "__boxedSkiaObject"));
    names.push_back(jsi::PropNameID::forUtf8(rt, "__brand"));
    return names;
  }

private:
  std::shared_ptr<jsi::NativeState> _state;
  std::string _brand;
};

/**
 * Boxes a Skia NativeObject-backed JS value so it can be serialized by
 * worklets and unboxed on another runtime.
 */
inline jsi::Value boxSkiaObject(jsi::Runtime &runtime,
                                const jsi::Value &value) {
  if (!value.isObject()) {
    throw jsi::JSError(runtime, "box() expects a Skia object");
  }
  auto object = value.asObject(runtime);
  if (!object.hasNativeState(runtime)) {
    throw jsi::JSError(runtime, "box() expects a Skia object");
  }
  auto brand = object.getProperty(runtime, "__typename__");
  if (!brand.isString()) {
    throw jsi::JSError(runtime, "box() expects a Skia object");
  }
  return jsi::Object::createFromHostObject(
      runtime, std::make_shared<JsiSkBoxedObject>(
                   object.getNativeState(runtime),
                   brand.asString(runtime).utf8(runtime)));
}

/**
 * Base class for Skia API objects implemented with the NativeObject /
 * jsi::NativeState pattern (see jsi2/NativeObject.h). Instead of a HostObject
 * intercepting every property access, methods and properties live on a shared
 * per-runtime prototype and the C++ instance is attached to plain JS objects
 * as native state.
 *
 * Derived classes must provide:
 * - `static constexpr const char *CLASS_NAME` — the public __typename__
 *   (e.g. "Rect"); also used as the boxing brand, so it must be unique.
 * - `static void definePrototype(jsi::Runtime&, jsi::Object& prototype)` —
 *   installs methods/getters and must call `installCommon(runtime, proto)`.
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
   * Installs the shared pieces every Skia class needs:
   * - the `__typename__` property (CLASS_NAME) used by JS type guards
   * - the `__box()` method and boxing reconstructor used to transfer objects
   *   across runtimes (see registerCustomSerializable in
   *   src/skia/SkiaWorkletSerialization.ts). `__box()` only relies on the
   *   prototype and native state, so it works on every runtime the object
   *   can live on.
   * Must be called from definePrototype().
   */
  static void installCommon(jsi::Runtime &runtime, jsi::Object &prototype) {
    prototype.setProperty(
        runtime, "__typename__",
        jsi::String::createFromUtf8(runtime, Derived::CLASS_NAME));

    auto boxFunc = jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, "__box"), 0,
        [](jsi::Runtime &rt, const jsi::Value &thisValue, const jsi::Value *,
           size_t) -> jsi::Value { return boxSkiaObject(rt, thisValue); });
    prototype.setProperty(runtime, "__box", boxFunc);

    static std::once_flag registered;
    std::call_once(registered, []() {
      JsiSkObjectRegistry::getInstance().registerClass(
          Derived::CLASS_NAME,
          [](jsi::Runtime &rt,
             std::shared_ptr<jsi::NativeState> state) -> jsi::Value {
            auto instance = std::dynamic_pointer_cast<Derived>(state);
            if (instance == nullptr) {
              throw jsi::JSError(rt, "Invalid boxed Skia object state");
            }
            return Derived::create(rt, std::move(instance));
          });
    });
  }

private:
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
   * Installs __typename__, boxing support and dispose() on the prototype.
   */
  static void installCommon(jsi::Runtime &runtime, jsi::Object &prototype) {
    JsiSkNativeObject<Derived>::installCommon(runtime, prototype);
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
