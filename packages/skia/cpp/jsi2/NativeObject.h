//
// NativeObject base class for JSI NativeState pattern
//

#pragma once

#include <functional>
#include <jsi/jsi.h>
#include <memory>
#include <mutex>
#include <optional>
#include <string>
#include <type_traits>
#include <unordered_map>
#include <utility>

#include "jsi/RuntimeAwareCache.h" // Use Skia's RuntimeAwareCache

// Forward declare to avoid circular dependency
namespace rnwgpu {
template <typename ArgType, typename SFINAE> struct JSIConverter;
} // namespace rnwgpu

// Include the converter - must come after forward declaration
#include "JSIConverter.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

// Forward declaration
template <typename Derived> class NativeObject;

/**
 * Registry for NativeObject prototype installers.
 * This allows BoxedWebGPUObject::unbox() to install prototypes on any runtime
 * by looking up the brand name and calling the appropriate installer.
 */
class NativeObjectRegistry {
public:
  using InstallerFunc = std::function<void(jsi::Runtime &)>;

  static NativeObjectRegistry &getInstance() {
    static NativeObjectRegistry instance;
    return instance;
  }

  void registerInstaller(const std::string &brand, InstallerFunc installer) {
    std::lock_guard<std::mutex> lock(_mutex);
    _installers[brand] = std::move(installer);
  }

  bool installPrototype(jsi::Runtime &runtime, const std::string &brand) {
    std::lock_guard<std::mutex> lock(_mutex);
    auto it = _installers.find(brand);
    if (it != _installers.end()) {
      it->second(runtime);
      return true;
    }
    return false;
  }

private:
  NativeObjectRegistry() = default;
  std::mutex _mutex;
  std::unordered_map<std::string, InstallerFunc> _installers;
};

/**
 * Per-runtime cache entry for a prototype object.
 * Uses std::optional<jsi::Object> so the prototype is stored directly
 * without extra indirection.
 */
struct PrototypeCacheEntry {
  std::optional<jsi::Object> prototype;
};

/**
 * Wrapper for static RuntimeAwareCache that handles hot reload.
 *
 * When used with static storage (like prototype caches), the cache persists
 * across hot reloads. But the JSI objects inside become invalid when the
 * runtime is destroyed. This wrapper tracks which runtime the cache was
 * created for and allocates a new cache when the runtime changes.
 *
 * The old cache is intentionally leaked - we cannot safely destroy JSI
 * objects after their runtime is gone.
 */
template <typename T> struct StaticRuntimeAwareCache {
  RNJsi::RuntimeAwareCache<T> *cache = nullptr;
  jsi::Runtime *cacheRuntime = nullptr;

  RNJsi::RuntimeAwareCache<T> &get(jsi::Runtime &rt) {
    auto mainRuntime = RNJsi::BaseRuntimeAwareCache::getMainJsRuntime();
    if (&rt == mainRuntime && cacheRuntime != mainRuntime) {
      // Main runtime changed (hot reload) - allocate new cache, leak old one
      cache = new RNJsi::RuntimeAwareCache<T>();
      cacheRuntime = mainRuntime;
    }
    if (cache == nullptr) {
      cache = new RNJsi::RuntimeAwareCache<T>();
      cacheRuntime = mainRuntime;
    }
    return *cache;
  }
};

/**
 * BoxedWebGPUObject is a HostObject wrapper that holds a reference to ANY
 * WebGPU NativeObject. This is used for Reanimated/Worklets serialization.
 *
 * Since NativeObject uses NativeState (not HostObject), Worklets can't
 * serialize them directly. But Worklets CAN serialize HostObjects.
 *
 * This class stores:
 * - The NativeState from the original object
 * - The brand name for prototype reconstruction
 *
 * Usage pattern with registerCustomSerializable:
 * - pack(): Call WebGPU.box(obj) to create a BoxedWebGPUObject (HostObject)
 * - The HostObject is serialized by Worklets and transferred to UI runtime
 * - unpack(): Call boxed.unbox() to get back the original object with prototype
 *
 * This is similar to NitroModules.box()/unbox() pattern.
 */
class BoxedWebGPUObject : public jsi::HostObject {
public:
  BoxedWebGPUObject(std::shared_ptr<jsi::NativeState> nativeState,
                    const std::string &brand)
      : _nativeState(std::move(nativeState)), _brand(brand) {}

  jsi::Value get(jsi::Runtime &runtime, const jsi::PropNameID &name) override {
    auto propName = name.utf8(runtime);
    if (propName == "unbox") {
      return jsi::Function::createFromHostFunction(
          runtime, jsi::PropNameID::forUtf8(runtime, "unbox"), 0,
          [this](jsi::Runtime &rt, const jsi::Value & /*thisVal*/,
                 const jsi::Value * /*args*/, size_t /*count*/) -> jsi::Value {
            // Try to get the prototype from the global constructor
            auto ctor = rt.global().getProperty(rt, _brand.c_str());
            if (!ctor.isObject()) {
              // Constructor doesn't exist on this runtime - install it
              NativeObjectRegistry::getInstance().installPrototype(rt, _brand);
              ctor = rt.global().getProperty(rt, _brand.c_str());
            }

            // Create a new object and attach the native state
            jsi::Object obj(rt);
            obj.setNativeState(rt, _nativeState);

            // Set the prototype if constructor exists
            if (ctor.isObject()) {
              auto ctorObj = ctor.getObject(rt);
              auto proto = ctorObj.getProperty(rt, "prototype");
              if (proto.isObject()) {
                auto objectCtor = rt.global().getPropertyAsObject(rt, "Object");
                auto setPrototypeOf =
                    objectCtor.getPropertyAsFunction(rt, "setPrototypeOf");
                setPrototypeOf.call(rt, obj, proto);
              }
            }

            return std::move(obj);
          });
    }
    if (propName == "__boxedWebGPU") {
      return jsi::Value(true);
    }
    if (propName == "__brand") {
      return jsi::String::createFromUtf8(runtime, _brand);
    }
    return jsi::Value::undefined();
  }

  void set(jsi::Runtime &runtime, const jsi::PropNameID &name,
           const jsi::Value &value) override {
    throw jsi::JSError(runtime, "BoxedWebGPUObject is read-only");
  }

  std::vector<jsi::PropNameID>
  getPropertyNames(jsi::Runtime &runtime) override {
    std::vector<jsi::PropNameID> names;
    names.reserve(3);
    names.push_back(jsi::PropNameID::forUtf8(runtime, "unbox"));
    names.push_back(jsi::PropNameID::forUtf8(runtime, "__boxedWebGPU"));
    names.push_back(jsi::PropNameID::forUtf8(runtime, "__brand"));
    return names;
  }

private:
  std::shared_ptr<jsi::NativeState> _nativeState;
  std::string _brand;
};

/**
 * Base class for native objects using the NativeState pattern.
 *
 * Instead of using HostObject (which intercepts all property access),
 * this pattern:
 * 1. Stores native data via jsi::Object::setNativeState()
 * 2. Installs methods on a shared prototype object (once per runtime)
 * 3. Creates plain JS objects that use the prototype chain
 *
 * Usage:
 * ```cpp
 * class MyClass : public NativeObject<MyClass> {
 * public:
 *   static constexpr const char* CLASS_NAME = "MyClass";
 *
 *   MyClass(...) : NativeObject(CLASS_NAME), ... {}
 *
 *   std::string getValue() { return _value; }
 *
 *   static void definePrototype(jsi::Runtime& rt, jsi::Object& proto) {
 *     installGetter(rt, proto, "value", &MyClass::getValue);
 *   }
 *
 * private:
 *   std::string _value;
 * };
 * ```
 */
template <typename Derived>
class NativeObject : public jsi::NativeState,
                     public std::enable_shared_from_this<Derived> {
public:
  // Marker type for SFINAE detection in JSIConverter
  using IsNativeObject = std::true_type;

  /**
   * Get the prototype cache for this type.
   * Each NativeObject<Derived> type has its own static cache.
   * Uses StaticRuntimeAwareCache to properly handle runtime lifecycle
   * and hot reload (where the main runtime is destroyed and recreated).
   */
  static RNJsi::RuntimeAwareCache<PrototypeCacheEntry> &
  getPrototypeCache(jsi::Runtime &runtime) {
    static StaticRuntimeAwareCache<PrototypeCacheEntry> cache;
    return cache.get(runtime);
  }

  /**
   * Ensure the prototype is installed for this runtime.
   * Called automatically by create(), but can be called manually.
   */
  static void installPrototype(jsi::Runtime &runtime) {
    auto &entry = getPrototypeCache(runtime).get(runtime);
    if (entry.prototype.has_value()) {
      return; // Already installed
    }

    // Create prototype object
    jsi::Object prototype(runtime);

    // Let derived class define its methods/properties
    Derived::definePrototype(runtime, prototype);

    // Add Symbol.toStringTag for proper object identification in console.log
    auto symbolCtor = runtime.global().getPropertyAsObject(runtime, "Symbol");
    auto toStringTag = symbolCtor.getProperty(runtime, "toStringTag");
    if (!toStringTag.isUndefined()) {
      // Use Object.defineProperty to set symbol property since setProperty
      // doesn't support symbols directly
      auto objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
      auto defineProperty =
          objectCtor.getPropertyAsFunction(runtime, "defineProperty");
      jsi::Object descriptor(runtime);
      descriptor.setProperty(
          runtime, "value",
          jsi::String::createFromUtf8(runtime, Derived::CLASS_NAME));
      descriptor.setProperty(runtime, "writable", false);
      descriptor.setProperty(runtime, "enumerable", false);
      descriptor.setProperty(runtime, "configurable", true);
      defineProperty.call(runtime, prototype, toStringTag, descriptor);
    }

    // Cache the prototype
    entry.prototype = std::move(prototype);
  }

  /**
   * Install a constructor function on the global object.
   * This enables `instanceof` checks: `obj instanceof ClassName`
   *
   * The constructor throws if called directly (these objects are only
   * created internally by the native code).
   *
   * Also registers this class with NativeObjectRegistry so that
   * BoxedWebGPUObject::unbox() can install prototypes on secondary runtimes.
   */
  static void installConstructor(jsi::Runtime &runtime) {
    // Register this class's installer in the registry (only needs to happen
    // once)
    static std::once_flag registryFlag;
    std::call_once(registryFlag, []() {
      NativeObjectRegistry::getInstance().registerInstaller(
          Derived::CLASS_NAME,
          [](jsi::Runtime &rt) { Derived::installConstructor(rt); });
    });

    installPrototype(runtime);

    auto &entry = getPrototypeCache(runtime).get(runtime);
    if (!entry.prototype.has_value()) {
      return;
    }

    // Create a constructor function that throws when called directly
    auto ctor = jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, Derived::CLASS_NAME), 0,
        [](jsi::Runtime &rt, const jsi::Value & /*thisVal*/,
           const jsi::Value * /*args*/, size_t /*count*/) -> jsi::Value {
          throw jsi::JSError(rt, std::string("Illegal constructor: ") +
                                     Derived::CLASS_NAME +
                                     " objects are created by the WebGPU API");
        });

    // Set the prototype property on the constructor
    // This is what makes `instanceof` work
    ctor.setProperty(runtime, "prototype", *entry.prototype);

    // Set constructor property on prototype pointing back to constructor
    entry.prototype->setProperty(runtime, "constructor", ctor);

    // Install on global
    runtime.global().setProperty(runtime, Derived::CLASS_NAME, std::move(ctor));
  }

  /**
   * Create a JS object with native state attached.
   */
  static jsi::Value create(jsi::Runtime &runtime,
                           std::shared_ptr<Derived> instance) {
    installPrototype(runtime);

    // Store creation runtime for logging etc.
    instance->setCreationRuntime(&runtime);

    // Create a new object
    jsi::Object obj(runtime);

    // Attach native state
    obj.setNativeState(runtime, instance);

    // Set prototype
    auto &entry = getPrototypeCache(runtime).get(runtime);
    if (entry.prototype.has_value()) {
      // Use Object.setPrototypeOf to set the prototype
      auto objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
      auto setPrototypeOf =
          objectCtor.getPropertyAsFunction(runtime, "setPrototypeOf");
      setPrototypeOf.call(runtime, obj, *entry.prototype);
    }

    // Set memory pressure hint for GC
    auto pressure = instance->getMemoryPressure();
    if (pressure > 0) {
      obj.setExternalMemoryPressure(runtime, pressure);
    }

    return std::move(obj);
  }

  /**
   * Get the native state from a JS value.
   * Throws if the value doesn't have the expected native state.
   */
  static std::shared_ptr<Derived> fromValue(jsi::Runtime &runtime,
                                            const jsi::Value &value) {
    if (!value.isObject()) {
      throw jsi::JSError(runtime, std::string("Expected ") +
                                      Derived::CLASS_NAME +
                                      " but got non-object");
    }
    jsi::Object obj = value.getObject(runtime);
    if (!obj.hasNativeState<Derived>(runtime)) {
      throw jsi::JSError(runtime, std::string("Expected ") +
                                      Derived::CLASS_NAME +
                                      " but got different type");
    }
    return obj.getNativeState<Derived>(runtime);
  }

  /**
   * Memory pressure for GC hints. Override in derived classes.
   */
  virtual size_t getMemoryPressure() { return 1024; }

  /**
   * Set the creation runtime. Called during create().
   */
  void setCreationRuntime(jsi::Runtime *runtime) { _creationRuntime = runtime; }

  /**
   * Get the creation runtime.
   * WARNING: This pointer may become invalid if the runtime is destroyed.
   */
  jsi::Runtime *getCreationRuntime() const { return _creationRuntime; }

protected:
  explicit NativeObject(const char *name) : _name(name) {}

  virtual ~NativeObject() {}

  const char *_name;
  jsi::Runtime *_creationRuntime = nullptr;

  // ============================================================
  // Helper methods for definePrototype() implementations
  // ============================================================

  /**
   * Install a method on the prototype.
   */
  template <typename ReturnType, typename... Args>
  static void installMethod(jsi::Runtime &runtime, jsi::Object &prototype,
                            const char *name,
                            ReturnType (Derived::*method)(Args...)) {
    auto func = jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, name), sizeof...(Args),
        [method](jsi::Runtime &rt, const jsi::Value &thisVal,
                 const jsi::Value *args, size_t count) -> jsi::Value {
          auto native = Derived::fromValue(rt, thisVal);
          return callMethod(native.get(), method, rt, args,
                            std::index_sequence_for<Args...>{}, count);
        });
    prototype.setProperty(runtime, name, func);
  }

  /**
   * Install a getter on the prototype.
   */
  template <typename ReturnType>
  static void installGetter(jsi::Runtime &runtime, jsi::Object &prototype,
                            const char *name, ReturnType (Derived::*getter)()) {
    // Create a getter function
    auto getterFunc = jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, std::string("get_") + name),
        0,
        [getter](jsi::Runtime &rt, const jsi::Value &thisVal,
                 const jsi::Value *args, size_t count) -> jsi::Value {
          auto native = Derived::fromValue(rt, thisVal);
          if constexpr (std::is_same_v<ReturnType, void>) {
            (native.get()->*getter)();
            return jsi::Value::undefined();
          } else {
            ReturnType result = (native.get()->*getter)();
            return rnwgpu::JSIConverter<std::decay_t<ReturnType>>::toJSI(
                rt, std::move(result));
          }
        });

    // Use Object.defineProperty to create a proper getter
    auto objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
    auto defineProperty =
        objectCtor.getPropertyAsFunction(runtime, "defineProperty");

    jsi::Object descriptor(runtime);
    descriptor.setProperty(runtime, "get", getterFunc);
    descriptor.setProperty(runtime, "enumerable", true);
    descriptor.setProperty(runtime, "configurable", true);

    defineProperty.call(runtime, prototype,
                        jsi::String::createFromUtf8(runtime, name), descriptor);
  }

  /**
   * Install a setter on the prototype.
   */
  template <typename ValueType>
  static void installSetter(jsi::Runtime &runtime, jsi::Object &prototype,
                            const char *name,
                            void (Derived::*setter)(ValueType)) {
    auto setterFunc = jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, std::string("set_") + name),
        1,
        [setter](jsi::Runtime &rt, const jsi::Value &thisVal,
                 const jsi::Value *args, size_t count) -> jsi::Value {
          if (count < 1) {
            throw jsi::JSError(rt, "Setter requires a value argument");
          }
          auto native = Derived::fromValue(rt, thisVal);
          auto value = rnwgpu::JSIConverter<std::decay_t<ValueType>>::fromJSI(
              rt, args[0], false);
          (native.get()->*setter)(std::move(value));
          return jsi::Value::undefined();
        });

    // Use Object.defineProperty to create a proper setter
    auto objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
    auto defineProperty =
        objectCtor.getPropertyAsFunction(runtime, "defineProperty");

    // Check if property already has a getter
    auto getOwnPropertyDescriptor =
        objectCtor.getPropertyAsFunction(runtime, "getOwnPropertyDescriptor");
    auto existingDesc = getOwnPropertyDescriptor.call(
        runtime, prototype, jsi::String::createFromUtf8(runtime, name));

    jsi::Object descriptor(runtime);
    if (existingDesc.isObject()) {
      auto existingDescObj = existingDesc.getObject(runtime);
      if (existingDescObj.hasProperty(runtime, "get")) {
        descriptor.setProperty(runtime, "get",
                               existingDescObj.getProperty(runtime, "get"));
      }
    }
    descriptor.setProperty(runtime, "set", setterFunc);
    descriptor.setProperty(runtime, "enumerable", true);
    descriptor.setProperty(runtime, "configurable", true);

    defineProperty.call(runtime, prototype,
                        jsi::String::createFromUtf8(runtime, name), descriptor);
  }

  /**
   * Install both getter and setter for a property.
   */
  template <typename ReturnType, typename ValueType>
  static void installGetterSetter(jsi::Runtime &runtime, jsi::Object &prototype,
                                  const char *name,
                                  ReturnType (Derived::*getter)(),
                                  void (Derived::*setter)(ValueType)) {
    auto getterFunc = jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, std::string("get_") + name),
        0,
        [getter](jsi::Runtime &rt, const jsi::Value &thisVal,
                 const jsi::Value *args, size_t count) -> jsi::Value {
          auto native = Derived::fromValue(rt, thisVal);
          ReturnType result = (native.get()->*getter)();
          return rnwgpu::JSIConverter<std::decay_t<ReturnType>>::toJSI(
              rt, std::move(result));
        });

    auto setterFunc = jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, std::string("set_") + name),
        1,
        [setter](jsi::Runtime &rt, const jsi::Value &thisVal,
                 const jsi::Value *args, size_t count) -> jsi::Value {
          if (count < 1) {
            throw jsi::JSError(rt, "Setter requires a value argument");
          }
          auto native = Derived::fromValue(rt, thisVal);
          auto value = rnwgpu::JSIConverter<std::decay_t<ValueType>>::fromJSI(
              rt, args[0], false);
          (native.get()->*setter)(std::move(value));
          return jsi::Value::undefined();
        });

    auto objectCtor = runtime.global().getPropertyAsObject(runtime, "Object");
    auto defineProperty =
        objectCtor.getPropertyAsFunction(runtime, "defineProperty");

    jsi::Object descriptor(runtime);
    descriptor.setProperty(runtime, "get", getterFunc);
    descriptor.setProperty(runtime, "set", setterFunc);
    descriptor.setProperty(runtime, "enumerable", true);
    descriptor.setProperty(runtime, "configurable", true);

    defineProperty.call(runtime, prototype,
                        jsi::String::createFromUtf8(runtime, name), descriptor);
  }

private:
  // Helper to call a method with JSI argument conversion
  template <typename ReturnType, typename... Args, size_t... Is>
  static jsi::Value callMethod(Derived *obj,
                               ReturnType (Derived::*method)(Args...),
                               jsi::Runtime &runtime, const jsi::Value *args,
                               std::index_sequence<Is...>, size_t count) {
    if constexpr (std::is_same_v<ReturnType, void>) {
      (obj->*method)(rnwgpu::JSIConverter<std::decay_t<Args>>::fromJSI(
          runtime, args[Is], Is >= count)...);
      return jsi::Value::undefined();
    } else if constexpr (std::is_same_v<ReturnType, jsi::Value>) {
      // Special case: if return type is jsi::Value, method has full control
      // This requires the method signature to match HostFunction
      return (obj->*method)(runtime, jsi::Value::undefined(), args, count);
    } else {
      ReturnType result =
          (obj->*method)(rnwgpu::JSIConverter<std::decay_t<Args>>::fromJSI(
              runtime, args[Is], Is >= count)...);
      return rnwgpu::JSIConverter<std::decay_t<ReturnType>>::toJSI(
          runtime, std::move(result));
    }
  }
};

// Type trait to detect NativeObject-derived classes
template <typename T> struct is_native_object : std::false_type {};

template <typename T>
struct is_native_object<std::shared_ptr<T>>
    : std::bool_constant<std::is_base_of_v<NativeObject<T>, T>> {};

} // namespace rnwgpu
