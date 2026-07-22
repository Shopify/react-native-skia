#pragma once

#include <memory>
#include <string>
#include <type_traits>
#include <utility>

#include <jsi/jsi.h>

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
 * NativeObject pattern, see JsiSkNativeObjects.h).
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

} // namespace RNSkia
