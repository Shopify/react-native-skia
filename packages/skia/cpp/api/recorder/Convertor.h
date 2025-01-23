#pragma once

#include <functional>
#include <optional>
#include <unordered_set>
#include <variant>
#include <vector>

#include <include/core/SkPaint.h>
#include <include/core/SkPoint.h>

#include <jsi/jsi.h>

namespace RNSkia {

using ConversionFunction = std::function<void()>;
using Updates = std::vector<ConversionFunction>;

bool isSharedValue(jsi::Runtime &runtime, const jsi::Value &value) {
  return value.isObject() && value.asObject(runtime).hasProperty(
                                        runtime, "_isReanimatedSharedValue");
}

// Helper type traits
template<typename T>
struct is_optional : std::false_type {};

template<typename T>
struct is_optional<std::optional<T>> : std::true_type {};

template<typename T>
struct unwrap_optional {
    using type = T;
};

template<typename T>
struct unwrap_optional<std::optional<T>> {
    using type = T;
};

// Property value getter declarations
template<typename T>
T getPropertyValue(jsi::Runtime& runtime, const jsi::Value& value);

// Base template for convertProperty
template<typename T, typename Target>
void convertPropertyImpl(jsi::Runtime& runtime, const jsi::Object& object,
                        const std::string& propertyName, Target& target,
                        Updates& updates) {
    if (!object.hasProperty(runtime, propertyName.c_str())) {
        return;
    }

    auto property = object.getProperty(runtime, propertyName.c_str());

    if (isSharedValue(runtime, property)) {
        auto sharedValue = property.asObject(runtime);
        auto conv = [&runtime, &sharedValue, &target, propertyName]() {
            auto value = sharedValue.getProperty(runtime, "value");
            target = getPropertyValue<T>(runtime, value);
        };
        updates.push_back(conv);
        conv();
    } else {
        target = getPropertyValue<T>(runtime, property);
    }
}

// Specialization for std::optional
template<typename T>
void convertProperty(jsi::Runtime& runtime, const jsi::Object& object,
                    const std::string& propertyName, std::optional<T>& target,
                     Updates& updates) {
    convertPropertyImpl<T>(runtime, object, propertyName, target, updates);
}

// Specialization for non-optional types
template<typename T>
void convertProperty(jsi::Runtime& runtime, const jsi::Object& object,
                    const std::string& propertyName, T& target,
                     Updates& updates) {
    convertPropertyImpl<T>(runtime, object, propertyName, target, updates);
}

// Property value getter implementations
template<>
float getPropertyValue(jsi::Runtime& runtime, const jsi::Value& value) {
    if (value.isNumber()) {
        return static_cast<float>(value.asNumber());
    }
    throw std::runtime_error("Invalid prop value received");
}

template<>
std::optional<float> getPropertyValue(jsi::Runtime& runtime, const jsi::Value& value) {
    if (value.isNumber()) {
        return static_cast<float>(value.asNumber());
    }
    return std::nullopt;
}

template<>
SkPoint getPropertyValue(jsi::Runtime& runtime, const jsi::Value& value) {
    if (value.isObject()) {
        auto x = value.asObject(runtime).getProperty(runtime, "x").asNumber();
        auto y = value.asObject(runtime).getProperty(runtime, "y").asNumber();
        return SkPoint::Make(x, y);
    }
    return SkPoint::Make(0, 0); // Or throw an exception if you prefer
}

template<>
std::optional<SkPoint> getPropertyValue(jsi::Runtime& runtime, const jsi::Value& value) {
    if (value.isObject()) {
        auto x = value.asObject(runtime).getProperty(runtime, "x").asNumber();
        auto y = value.asObject(runtime).getProperty(runtime, "y").asNumber();
        return SkPoint::Make(x, y);
    }
    return std::nullopt;
}



} // namespace RNSkia
