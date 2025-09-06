#pragma once

#include <memory>
#include <utility>

#include "JsiHostObject.h"
#include "RNSkPlatformContext.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

/**
 * Base class for jsi host objects - these are all implemented as JsiHostObjects
 * and has a pointer to the platform context.
 */
class JsiSkHostObject : public RNJsi::JsiHostObject {
public:
  /**
   * Default constructor
   * @param context Platform context
   */
  explicit JsiSkHostObject(std::shared_ptr<RNSkPlatformContext> context)
      : _context(context) {}

protected:
  /**
   * @return A pointer to the platform context
   */
  std::shared_ptr<RNSkPlatformContext> getContext() { return _context; }

private:
  std::shared_ptr<RNSkPlatformContext> _context;
};

#define JSI_API_TYPENAME(A)                                                    \
  JSI_PROPERTY_GET(__typename__) {                                             \
    return jsi::String::createFromUtf8(runtime, #A);                           \
  }

#define EXPORT_JSI_API_TYPENAME(CLASS, TYPENAME)                               \
  JSI_API_TYPENAME(TYPENAME)                                                   \
  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(CLASS, __typename__))

/**
 * Helper macro to create a JSI object from a host object and initialize memory pressure.
 * Usage: CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, hostObject)
 */
#define CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, hostObject)           \
  ([&]() {                                                                     \
    auto jsObj = jsi::Object::createFromHostObject(runtime, hostObject);       \
    hostObject->initializeMemoryPressure(runtime, jsObj);                      \
    return jsObj;                                                              \
  }())

template <typename T> class JsiSkWrappingHostObject : public JsiSkHostObject {
public:
  /**
   * Default constructor
   * @param context Platform context
   */
  JsiSkWrappingHostObject(std::shared_ptr<RNSkPlatformContext> context,
                          T object)
      : JsiSkHostObject(std::move(context)), _object(std::move(object)) {}

  /**
   * Returns the underlying object exposed by this host object. This object
   * should be wrapped in a shared pointer of some kind.
   * Throws if the object has been disposed.
   * @return Underlying object
   */
  T getObject() { return validateObject(); }
  const T getObject() const { return validateObject(); }

  /**
   * Updates the inner object with a new version of the object.
   * Also updates memory pressure if applicable.
   */
  void setObject(T object) { 
    _object = object;
    updateMemoryPressure();
  }
  
  /**
   * Called to update the external memory pressure for this object.
   * Should be called after object creation and after any significant
   * modifications to the wrapped object.
   * Note: This requires being called from a context where we have access
   * to the runtime and JSI object.
   */
  void updateMemoryPressure() {
    // This will be called from methods that have access to runtime
    // The actual implementation needs to happen in the concrete classes
  }
  
  /**
   * Initialize memory pressure for this object.
   * Should be called right after the host object is wrapped in a JSI object.
   */
  void initializeMemoryPressure(jsi::Runtime& runtime, const jsi::Object& jsObject) {
    if (!_isDisposed) {
      size_t pressure = getExternalMemorySize();
      jsObject.setExternalMemoryPressure(runtime, pressure);
      _lastMemoryPressure = pressure;
    }
  }

  /**
   * Dispose function that can be exposed to JS by using the JSI_API_TYPENAME
   * macro.
   */
  JSI_HOST_FUNCTION(dispose) {
    safeDispose();
    return jsi::Value::undefined();
  }

protected:
  /**
   * Override to implement disposal of allocated resources like smart pointers.
   * This method will only be called once for each instance of this class.
   */
  virtual void releaseResources() = 0;
  
  /**
   * Override to provide the external memory size of the wrapped object.
   * This is used to inform the JS engine about memory pressure.
   * Return 0 if the object doesn't use significant external memory.
   */
  virtual size_t getExternalMemorySize() const { return 0; }
  
  /**
   * Track last memory pressure to avoid redundant updates.
   */
  mutable size_t _lastMemoryPressure = 0;

private:
  /**
   * Validates that _object was not disposed and returns it.
   */
  T validateObject() const {
    if (_isDisposed) {
      throw std::runtime_error("Attempted to access a disposed object.");
    }
    return _object;
  }

  void safeDispose() {
    if (!_isDisposed) {
      _isDisposed = true;
      releaseResources();
    }
  }

  /**
   * Wrapped object.
   */
  T _object;

  /**
   * Resource disposed flag.
   */
  std::atomic<bool> _isDisposed = {false};
};

template <typename T>
class JsiSkWrappingSharedPtrHostObject
    : public JsiSkWrappingHostObject<std::shared_ptr<T>> {
public:
  JsiSkWrappingSharedPtrHostObject(std::shared_ptr<RNSkPlatformContext> context,
                                   std::shared_ptr<T> object)
      : JsiSkWrappingHostObject<std::shared_ptr<T>>(std::move(context),
                                                    std::move(object)) {}

  /**
    Returns the underlying object from a host object of this type
   */
  static std::shared_ptr<T> fromValue(jsi::Runtime &runtime,
                                      const jsi::Value &obj) {
    return std::static_pointer_cast<JsiSkWrappingSharedPtrHostObject>(
               obj.asObject(runtime).asHostObject(runtime))
        ->getObject();
  }

protected:
  void releaseResources() override {
    // Clear internally allocated objects
    this->setObject(nullptr);
  }
};

template <typename T>
class JsiSkWrappingSkPtrHostObject : public JsiSkWrappingHostObject<sk_sp<T>> {
public:
  JsiSkWrappingSkPtrHostObject(std::shared_ptr<RNSkPlatformContext> context,
                               sk_sp<T> object)
      : JsiSkWrappingHostObject<sk_sp<T>>(std::move(context),
                                          std::move(object)) {}

  /**
    Returns the underlying object from a host object of this type
   */
  static sk_sp<T> fromValue(jsi::Runtime &runtime, const jsi::Value &obj) {
    return std::static_pointer_cast<JsiSkWrappingSkPtrHostObject>(
               obj.asObject(runtime).asHostObject(runtime))
        ->getObject();
  }

protected:
  void releaseResources() override {
    // Clear internally allocated objects
    this->setObject(nullptr);
  }
};

} // namespace RNSkia
