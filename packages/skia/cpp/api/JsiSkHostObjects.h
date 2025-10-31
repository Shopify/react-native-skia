#pragma once

#include <memory>
#include <string>
#include <utility>

#include "JsiHostObject.h"
#include "RNSkLog.h"
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

  /**
   * Override this method to return the memory pressure for the wrapped object.
   * @return The memory pressure in bytes
   */
  virtual size_t getMemoryPressure() const = 0;

  /**
   * Returns the type name of the host object.
   */
  virtual std::string getObjectType() const = 0;

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

// Define this macro to enable memory pressure debug logging
// #define RNSKIA_DEBUG_MEMORY_PRESSURE

#ifdef RNSKIA_DEBUG_MEMORY_PRESSURE
// Version with debug logging
#define JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(                           \
    runtime, hostObjectInstance, context)                                      \
  [&]() {                                                                      \
    auto result =                                                              \
        jsi::Object::createFromHostObject(runtime, hostObjectInstance);        \
    auto memoryPressure = hostObjectInstance->getMemoryPressure();             \
    const void *hostObjectId =                                                 \
        static_cast<const void *>(hostObjectInstance.get());                   \
    const char *mpUnit = "bytes";                                              \
    double mpValue = static_cast<double>(memoryPressure);                      \
    if (memoryPressure >= 1024ULL * 1024ULL) {                                 \
      mpUnit = "MB";                                                           \
      mpValue /= (1024.0 * 1024.0);                                            \
      RNSkLogger::logToConsole(                                                \
          "Host object %s (id=%p) memory pressure %.2f %s",                    \
          hostObjectInstance->getObjectType().c_str(), hostObjectId, mpValue,  \
          mpUnit);                                                             \
    } else if (memoryPressure >= 1024ULL) {                                    \
      mpUnit = "KB";                                                           \
      mpValue /= 1024.0;                                                       \
      RNSkLogger::logToConsole(                                                \
          "Host object %s (id=%p) memory pressure %.2f %s",                    \
          hostObjectInstance->getObjectType().c_str(), hostObjectId, mpValue,  \
          mpUnit);                                                             \
    } else {                                                                   \
      RNSkLogger::logToConsole(                                                \
          "Host object %s (id=%p) memory pressure %zu %s",                     \
          hostObjectInstance->getObjectType().c_str(), hostObjectId,           \
          memoryPressure, mpUnit);                                             \
    }                                                                          \
    if (memoryPressure > 0) {                                                  \
      result.setExternalMemoryPressure(runtime, memoryPressure);               \
    }                                                                          \
    return result;                                                             \
  }()
#else
// Version without debug logging (optimized)
#define JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(                           \
    runtime, hostObjectInstance, context)                                      \
  [&]() {                                                                      \
    auto result =                                                              \
        jsi::Object::createFromHostObject(runtime, hostObjectInstance);        \
    auto memoryPressure = hostObjectInstance->getMemoryPressure();             \
    if (memoryPressure > 0) {                                                  \
      result.setExternalMemoryPressure(runtime, memoryPressure);               \
    }                                                                          \
    return result;                                                             \
  }()
#endif

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
  T getObject() { return _object; }
  const T getObject() const { return _object; }

  /**
   * Updates the inner object with a new version of the object.
   */
  void setObject(T object) { _object = object; }

  /**
   * Dispose function that can be exposed to JS by using the JSI_API_TYPENAME
   * macro.
   */
  JSI_HOST_FUNCTION(dispose) {
    // This is a no-op on native
    return jsi::Value::undefined();
  }

private:
  /**
   * Wrapped object.
   */
  T _object;
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
};

} // namespace RNSkia
