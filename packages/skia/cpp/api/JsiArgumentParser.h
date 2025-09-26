#pragma once

#include <jsi/jsi.h>
#include <optional>
#include <variant>
#include <vector>
#include <tuple>
#include <type_traits>
#include <stdexcept>
#include <string>

#include "JsiTypeTraits.h"

namespace RNSkia {
namespace jsi = facebook::jsi;

// Forward declarations for Skia JSI objects
class JsiSkPaint;
class JsiSkRect;
class JsiSkImage;
class JsiSkPath;
class JsiSkPoint;
class JsiSkRRect;
class JsiSkFont;
class JsiSkImageFilter;
class JsiSkMatrix;
class JsiSkColor;

// Type traits for JSI type detection
template<typename T> struct is_vector : std::false_type {};
template<typename T> struct is_vector<std::vector<T>> : std::true_type {};

// Note: is_optional and unwrap_optional are defined in JsiTypeTraits.h

// Base argument extraction trait
template<typename T>
struct ArgumentExtractor {
    static T extract(jsi::Runtime& runtime, const jsi::Value& value, size_t index);
};

// Specializations for primitive types
template<>
struct ArgumentExtractor<float> {
    static float extract(jsi::Runtime& runtime, const jsi::Value& value, size_t index) {
        if (!value.isNumber()) {
            throw std::runtime_error("Expected number at argument " + std::to_string(index));
        }
        return static_cast<float>(value.asNumber());
    }
};

template<>
struct ArgumentExtractor<double> {
    static double extract(jsi::Runtime& runtime, const jsi::Value& value, size_t index) {
        if (!value.isNumber()) {
            throw std::runtime_error("Expected number at argument " + std::to_string(index));
        }
        return value.asNumber();
    }
};

template<>
struct ArgumentExtractor<int> {
    static int extract(jsi::Runtime& runtime, const jsi::Value& value, size_t index) {
        if (!value.isNumber()) {
            throw std::runtime_error("Expected number at argument " + std::to_string(index));
        }
        return static_cast<int>(value.asNumber());
    }
};

template<>
struct ArgumentExtractor<uint32_t> {
    static uint32_t extract(jsi::Runtime& runtime, const jsi::Value& value, size_t index) {
        if (!value.isNumber()) {
            throw std::runtime_error("Expected number at argument " + std::to_string(index));
        }
        return static_cast<uint32_t>(value.asNumber());
    }
};

template<>
struct ArgumentExtractor<bool> {
    static bool extract(jsi::Runtime& runtime, const jsi::Value& value, size_t index) {
        if (!value.isBool()) {
            throw std::runtime_error("Expected boolean at argument " + std::to_string(index));
        }
        return value.getBool();
    }
};

template<>
struct ArgumentExtractor<std::string> {
    static std::string extract(jsi::Runtime& runtime, const jsi::Value& value, size_t index) {
        if (!value.isString()) {
            throw std::runtime_error("Expected string at argument " + std::to_string(index));
        }
        return value.asString(runtime).utf8(runtime);
    }
};

// Note: SkScalar is typedef'd as float, so it uses the float specialization

// Specialization for optional types
template<typename T>
struct ArgumentExtractor<std::optional<T>> {
    static std::optional<T> extract(jsi::Runtime& runtime, const jsi::Value& value, size_t index) {
        if (value.isNull() || value.isUndefined()) {
            return std::nullopt;
        }
        return ArgumentExtractor<T>::extract(runtime, value, index);
    }
};

// Specialization for vectors/arrays
template<typename T>
struct ArgumentExtractor<std::vector<T>> {
    static std::vector<T> extract(jsi::Runtime& runtime, const jsi::Value& value, size_t index) {
        if (!value.isObject()) {
            throw std::runtime_error("Expected array at argument " + std::to_string(index));
        }

        auto obj = value.asObject(runtime);
        if (!obj.isArray(runtime)) {
            throw std::runtime_error("Expected array at argument " + std::to_string(index));
        }

        auto arr = obj.asArray(runtime);
        size_t size = arr.size(runtime);
        std::vector<T> result;
        result.reserve(size);

        for (size_t i = 0; i < size; i++) {
            auto element = arr.getValueAtIndex(runtime, i);
            result.push_back(ArgumentExtractor<T>::extract(runtime, element, index));
        }
        return result;
    }
};

// Main ArgumentParser class
class ArgumentParser {
private:
    jsi::Runtime& runtime;
    const jsi::Value* arguments;
    size_t count;
    size_t current_index = 0;

public:
    ArgumentParser(jsi::Runtime& rt, const jsi::Value* args, size_t cnt)
        : runtime(rt), arguments(args), count(cnt) {}

    // Get required argument
    template<typename T>
    T get() {
        if (current_index >= count) {
            if constexpr (is_optional<T>::value) {
                // If it's optional and we're out of args, return nullopt
                current_index++;
                return std::nullopt;
            } else {
                throw std::runtime_error("Not enough arguments provided. Expected argument at index " +
                                       std::to_string(current_index));
            }
        }
        auto result = ArgumentExtractor<T>::extract(runtime, arguments[current_index], current_index);
        current_index++;
        return result;
    }

    // Get optional argument (explicit method for clarity)
    template<typename T>
    std::optional<T> optional() {
        if (current_index >= count) {
            return std::nullopt;
        }
        auto result = ArgumentExtractor<std::optional<T>>::extract(runtime, arguments[current_index], current_index);
        current_index++;
        return result;
    }

    // Get argument with default value
    template<typename T>
    T get_or(const T& default_value) {
        if (current_index >= count) {
            return default_value;
        }
        auto result = ArgumentExtractor<T>::extract(runtime, arguments[current_index], current_index);
        current_index++;
        return result;
    }

    // Multi-argument extraction using tuple
    template<typename... Args>
    std::tuple<Args...> get_args() {
        return std::make_tuple(get<Args>()...);
    }

    // Remaining arguments as vector
    template<typename T>
    std::vector<T> remaining() {
        std::vector<T> result;
        while (current_index < count) {
            result.push_back(get<T>());
        }
        return result;
    }

    // Peek at next argument without consuming it
    template<typename T>
    T peek() const {
        if (current_index >= count) {
            throw std::runtime_error("No more arguments to peek at");
        }
        return ArgumentExtractor<T>::extract(runtime, arguments[current_index], current_index);
    }

    // Skip argument (useful for overloads)
    void skip() {
        if (current_index >= count) {
            throw std::runtime_error("No argument to skip at index " + std::to_string(current_index));
        }
        current_index++;
    }

    // Check if next argument is of specific type
    template<typename T>
    bool next_is() const {
        if (current_index >= count) {
            return false;
        }
        try {
            ArgumentExtractor<T>::extract(runtime, arguments[current_index], current_index);
            return true;
        } catch (...) {
            return false;
        }
    }

    // Utility methods
    size_t remaining_count() const { return count - current_index; }
    bool has_more() const { return current_index < count; }
    size_t total_count() const { return count; }
    size_t current_position() const { return current_index; }

    // Reset parser to beginning
    void reset() { current_index = 0; }

    // Validate minimum number of arguments
    void require_min(size_t min_args) const {
        if (count < min_args) {
            throw std::runtime_error("Expected at least " + std::to_string(min_args) +
                                   " arguments, got " + std::to_string(count));
        }
    }

    // Validate exact number of arguments
    void require_exact(size_t exact_args) const {
        if (count != exact_args) {
            throw std::runtime_error("Expected exactly " + std::to_string(exact_args) +
                                   " arguments, got " + std::to_string(count));
        }
    }

    // Validate argument range
    void require_range(size_t min_args, size_t max_args) const {
        if (count < min_args || count > max_args) {
            throw std::runtime_error("Expected " + std::to_string(min_args) + "-" +
                                   std::to_string(max_args) + " arguments, got " + std::to_string(count));
        }
    }
};

// Convenience macro for creating argument parsers
#define PARSE_ARGS() ArgumentParser parser(runtime, arguments, count)

// Convenience macro for argument validation
#define REQUIRE_ARGS(n) do { \
    if (count < (n)) { \
        throw std::runtime_error("Expected at least " + std::to_string(n) + " arguments, got " + std::to_string(count)); \
    } \
} while(0)

#define REQUIRE_EXACT_ARGS(n) do { \
    if (count != (n)) { \
        throw std::runtime_error("Expected exactly " + std::to_string(n) + " arguments, got " + std::to_string(count)); \
    } \
} while(0)

} // namespace RNSkia
