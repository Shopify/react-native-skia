#pragma once

#include <functional>
#include <map>
#include <optional>
#include <variant>
#include <vector>

#include <include/core/SkPaint.h>
#include <include/core/SkPoint.h>

#include "third_party/CSSColorParser.h"

#include <jsi/jsi.h>

namespace RNSkia {

using ConversionFunction =
    std::function<void(jsi::Runtime &runtime, const jsi::Object &object)>;
using Variables = std::map<std::string, std::vector<ConversionFunction>>;

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
    std::string name = property.asObject(runtime)
                           .getProperty(runtime, "name")
                           .asString(runtime)
                           .utf8(runtime);
    auto sharedValue = property.asObject(runtime);
    auto conv = [target = &target](jsi::Runtime &runtime,
                                   const jsi::Object &val) {
      auto value = val.getProperty(runtime, "value");
      *target = getPropertyValue<T>(runtime, value);
    };
    variables[name].push_back(conv);
    conv(runtime, sharedValue);
  } else {
    target = getPropertyValue<T>(runtime, property);
  }
}

// Main convertProperty template
template <typename T>
void convertProperty(jsi::Runtime &runtime, const jsi::Object &object,
                     const std::string &propertyName, T &target,
                     Variables &variables) {
  if constexpr (is_optional<T>::value) {
    using ValueType = typename unwrap_optional<T>::type;
    target = getPropertyValue<T>(
        runtime, object.getProperty(runtime, propertyName.c_str()));
  } else {
    convertPropertyImpl<T>(runtime, object, propertyName, target, variables);
  }
}

// Base property value getter implementations
template <>
float getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isNumber()) {
    return static_cast<float>(value.asNumber());
  }
  throw std::runtime_error("Invalid prop value received");
}

template <>
SkPoint getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isObject()) {
    auto x = value.asObject(runtime).getProperty(runtime, "x").asNumber();
    auto y = value.asObject(runtime).getProperty(runtime, "y").asNumber();
    return SkPoint::Make(x, y);
  }
  throw std::runtime_error("Invalid prop value for SkPoint received");
}

template <>
SkColor getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isNumber()) {
    return static_cast<SkColor>(value.asNumber());
  } else if (value.isString()) {
    auto text = value.asString(runtime).utf8(runtime);
    auto color = CSSColorParser::parse(text);
    if (color.a == -1.0f) {
      return SK_ColorBLACK;
    }
    return SkColorSetARGB(color.a * 255, color.r, color.g, color.b);
  } else if (value.isObject()) {
    const auto &object = value.asObject(runtime);
    if (object.isArray(runtime)) {
      auto array = object.asArray(runtime);
      auto r = array.getValueAtIndex(runtime, 0).asNumber();
      auto g = array.getValueAtIndex(runtime, 1).asNumber();
      auto b = array.getValueAtIndex(runtime, 2).asNumber();
      auto a = array.getValueAtIndex(runtime, 3).asNumber();
      return SkColorSetARGB(a * 255, r * 255, g * 255, b * 255);
    }
    jsi::ArrayBuffer buffer =
        object
            .getProperty(runtime, jsi::PropNameID::forAscii(runtime, "buffer"))
            .asObject(runtime)
            .getArrayBuffer(runtime);
    auto bfrPtr = reinterpret_cast<float *>(buffer.data(runtime));
    if (bfrPtr[0] > 1 || bfrPtr[1] > 1 || bfrPtr[2] > 1 || bfrPtr[3] > 1) {
      return SK_ColorBLACK;
    }
    return SkColorSetARGB(bfrPtr[3] * 255, bfrPtr[0] * 255, bfrPtr[1] * 255,
                          bfrPtr[2] * 255);
  }
  throw std::runtime_error("Invalid prop value for SkColor received");
}

//
template <typename T>
std::optional<T> makeOptionalPropertyValue(jsi::Runtime &runtime,
                                           const jsi::Value &value) {
  if (value.isNull() || value.isUndefined()) {
    return std::nullopt;
  }
  try {
    return getPropertyValue<T>(runtime, value);
  } catch (const std::runtime_error &) {
    return std::nullopt;
  }
}

template <>
std::optional<float> getPropertyValue(jsi::Runtime &runtime,
                                      const jsi::Value &value) {
  return makeOptionalPropertyValue<float>(runtime, value);
}

template <>
std::optional<SkPoint> getPropertyValue(jsi::Runtime &runtime,
                                        const jsi::Value &value) {
  return makeOptionalPropertyValue<SkPoint>(runtime, value);
}

template <>
std::optional<SkColor> getPropertyValue(jsi::Runtime &runtime,
                                        const jsi::Value &value) {
  return makeOptionalPropertyValue<SkColor>(runtime, value);
}

} // namespace RNSkia
