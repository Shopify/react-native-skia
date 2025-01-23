#pragma once

#include <functional>
#include <map>
#include <optional>
#include <variant>
#include <vector>

#include <include/core/SkPaint.h>
#include <include/core/SkPoint.h>

#include <jsi/jsi.h>

namespace RNSkia {

using ConversionFunction = std::function<void(void *val, jsi::Runtime &runtime)>;
using Variables = std::map<void *, std::vector<ConversionFunction>>;

bool isSharedValue(jsi::Runtime &runtime, const jsi::Value &value) {
  return value.isObject() && value.asObject(runtime).hasProperty(
                                 runtime, "_isReanimatedSharedValue");
}

// Helper type traits
template <typename T> struct is_optional : std::false_type {};

template <typename T> struct is_optional<std::optional<T>> : std::true_type {};

template <typename T> struct unwrap_optional {
  using type = T;
};

template <typename T> struct unwrap_optional<std::optional<T>> {
  using type = T;
};

// Property value getter declarations
template <typename T>
T getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value);

// Base template for convertProperty
template <typename T, typename Target>
void convertPropertyImpl(jsi::Runtime &runtime, const jsi::Object &object,
                         const std::string &propertyName, Target &target,
                         Variables &variables) {
  if (!object.hasProperty(runtime, propertyName.c_str())) {
    return;
  }

  auto property = object.getProperty(runtime, propertyName.c_str());

  if (isSharedValue(runtime, property)) {
    void *sharedValue = property.asObject(runtime).asHostObject(runtime).get();
    auto conv = [&sharedValue, &target](void *val, jsi::Runtime &runtime) {
      jsi::Object jsObject = jsi::Object::createFromHostObject(
          runtime, std::shared_ptr<jsi::HostObject>(
                       static_cast<jsi::HostObject *>(val)));
      auto value = jsObject.getProperty(runtime, "value");
      target = getPropertyValue<T>(runtime, value);
    };
    variables[sharedValue].push_back(conv);
    conv(sharedValue, runtime);
  } else {
    target = getPropertyValue<T>(runtime, property);
  }
}

// Specialization for std::optional
template <typename T>
void convertProperty(jsi::Runtime &runtime, const jsi::Object &object,
                     const std::string &propertyName, std::optional<T> &target,
                     Variables &variables) {
  convertPropertyImpl<T>(runtime, object, propertyName, target, variables);
}

// Specialization for non-optional types
template <typename T>
void convertProperty(jsi::Runtime &runtime, const jsi::Object &object,
                     const std::string &propertyName, T &target,
                     Variables &variables) {
  convertPropertyImpl<T>(runtime, object, propertyName, target, variables);
}

// Property value getter implementations
template <>
float getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isNumber()) {
    return static_cast<float>(value.asNumber());
  }
  throw std::runtime_error("Invalid prop value received");
}

template <>
std::optional<float> getPropertyValue(jsi::Runtime &runtime,
                                      const jsi::Value &value) {
  if (value.isNumber()) {
    return static_cast<float>(value.asNumber());
  }
  return std::nullopt;
}

template <>
SkPoint getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isObject()) {
    auto x = value.asObject(runtime).getProperty(runtime, "x").asNumber();
    auto y = value.asObject(runtime).getProperty(runtime, "y").asNumber();
    return SkPoint::Make(x, y);
  }
  return SkPoint::Make(0, 0); // Or throw an exception if you prefer
}

template <>
std::optional<SkPoint> getPropertyValue(jsi::Runtime &runtime,
                                        const jsi::Value &value) {
  if (value.isObject()) {
    auto x = value.asObject(runtime).getProperty(runtime, "x").asNumber();
    auto y = value.asObject(runtime).getProperty(runtime, "y").asNumber();
    return SkPoint::Make(x, y);
  }
  return std::nullopt;
}

} // namespace RNSkia
