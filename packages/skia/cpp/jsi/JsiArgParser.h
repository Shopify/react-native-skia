#pragma once

#include <jsi/jsi.h>
#include <memory>
#include <optional>
#include <string>
#include <type_traits>

namespace RNSkia {

namespace jsi = facebook::jsi;

namespace detail {

/**
 * Helper type trait to detect std::optional<T>
 */
template <typename T> struct is_optional : std::false_type {};

template <typename T> struct is_optional<std::optional<T>> : std::true_type {};

template <typename T>
inline constexpr bool is_optional_v = is_optional<T>::value;

/**
 * Helper traits to detect shared_ptr and sk_sp types
 */
template <typename T> struct is_shared_ptr : std::false_type {};

template <typename T>
struct is_shared_ptr<std::shared_ptr<T>> : std::true_type {
  using element_type = T;
};

template <typename T> struct is_sk_sp : std::false_type {};

template <typename T> struct is_sk_sp<sk_sp<T>> : std::true_type {
  using element_type = T;
};

} // namespace detail

/**
 * Traits class for parsing specific types - specialize this for custom types
 */
template <typename T> struct ArgParserTraits {
  static std::shared_ptr<T> parseSharedPtr(jsi::Runtime &runtime,
                                           const jsi::Value &value) {
    // Default implementation - will cause compile error if not specialized
    static_assert(sizeof(T) == 0,
                  "ArgParserTraits not specialized for this type. "
                  "Use JSI_ARG_PARSER_SHARED_PTR macro.");
    return nullptr;
  }

  static sk_sp<T> parseSkSp(jsi::Runtime &runtime, const jsi::Value &value) {
    // Default implementation - will cause compile error if not specialized
    static_assert(sizeof(T) == 0,
                  "ArgParserTraits not specialized for this type. "
                  "Use JSI_ARG_PARSER_SK_SP macro.");
    return nullptr;
  }
};

/**
 * ArgParser - A utility class for parsing JSI function arguments sequentially
 *
 * Usage:
 *   ArgParser parser(runtime, arguments, count);
 *   auto image = parser.next<sk_sp<SkImage>>();  // required argument
 *   auto x = parser.next<float>();                // required argument
 *   auto paint = parser.next<std::optional<std::shared_ptr<SkPaint>>>();  //
 * optional
 *
 * The parser automatically:
 * - Validates argument availability for required arguments
 * - Returns std::nullopt for missing/null/undefined optional arguments
 * - Advances the internal index after each call
 * - Provides clear error messages with argument positions
 */
class ArgParser {
public:
  ArgParser(jsi::Runtime &runtime, const jsi::Value *arguments, size_t count)
      : _runtime(runtime), _arguments(arguments), _count(count), _index(0) {}

  /**
   * Parse the next argument.
   * - For regular types T: throws if argument is missing, returns T
   * - For std::optional<T>: returns std::nullopt if missing/null/undefined,
   * otherwise T
   */
  template <typename T> T next() {
    if constexpr (detail::is_optional_v<T>) {
      // Handle std::optional<U>
      using U = typename T::value_type;

      // Check if we're beyond available arguments
      if (_index >= _count) {
        _index++;
        return std::nullopt;
      }

      // Check if argument is null or undefined
      if (_arguments[_index].isNull() || _arguments[_index].isUndefined()) {
        _index++;
        return std::nullopt;
      }

      // Parse and return the value
      return parse<U>(_arguments[_index++]);
    } else {
      // Handle required argument
      if (_index >= _count) {
        throw jsi::JSError(_runtime, "Missing required argument at index " +
                                         std::to_string(_index));
      }

      return parse<T>(_arguments[_index++]);
    }
  }

  /**
   * Get the current argument index (useful for error messages)
   */
  size_t currentIndex() const { return _index; }

  /**
   * Get the total number of arguments
   */
  size_t totalCount() const { return _count; }

  /**
   * Check if there are more arguments available
   */
  bool hasMore() const { return _index < _count; }

  /**
   * Reset the parser to start from the beginning
   */
  void reset() { _index = 0; }

private:
  jsi::Runtime &_runtime;
  const jsi::Value *_arguments;
  size_t _count;
  size_t _index;

  /**
   * Type-specific parsing implementations
   * These are ordered by priority - more specific matches first
   */

  // For shared_ptr types - uses ArgParserTraits for customization (highest
  // priority for ptr types)
  template <typename T>
  typename std::enable_if<detail::is_shared_ptr<T>::value, T>::type
  parse(const jsi::Value &value) {
    using ElementType = typename detail::is_shared_ptr<T>::element_type;
    return ArgParserTraits<ElementType>::parseSharedPtr(_runtime, value);
  }

  // For sk_sp types - uses ArgParserTraits for customization
  template <typename T>
  typename std::enable_if<detail::is_sk_sp<T>::value, T>::type
  parse(const jsi::Value &value) {
    using ElementType = typename detail::is_sk_sp<T>::element_type;
    return ArgParserTraits<ElementType>::parseSkSp(_runtime, value);
  }

  // Primitive types
  template <typename T>
  typename std::enable_if<
      std::is_same<T, float>::value || std::is_same<T, double>::value, T>::type
  parse(const jsi::Value &value) {
    if (!value.isNumber()) {
      throw jsi::JSError(_runtime, "Expected number for argument at index " +
                                       std::to_string(_index));
    }
    return static_cast<T>(value.asNumber());
  }

  template <typename T>
  typename std::enable_if<
      std::is_integral<T>::value && !std::is_same<T, bool>::value, T>::type
  parse(const jsi::Value &value) {
    if (!value.isNumber()) {
      throw jsi::JSError(_runtime, "Expected number for argument at index " +
                                       std::to_string(_index));
    }
    return static_cast<T>(value.asNumber());
  }

  template <typename T>
  typename std::enable_if<std::is_same<T, bool>::value, T>::type
  parse(const jsi::Value &value) {
    if (!value.isBool()) {
      throw jsi::JSError(_runtime, "Expected boolean for argument at index " +
                                       std::to_string(_index));
    }
    return value.getBool();
  }

  template <typename T>
  typename std::enable_if<std::is_same<T, std::string>::value, T>::type
  parse(const jsi::Value &value) {
    if (!value.isString()) {
      throw jsi::JSError(_runtime, "Expected string for argument at index " +
                                       std::to_string(_index));
    }
    return value.asString(_runtime).utf8(_runtime);
  }

  template <typename T>
  typename std::enable_if<std::is_same<T, jsi::String>::value, T>::type
  parse(const jsi::Value &value) {
    if (!value.isString()) {
      throw jsi::JSError(_runtime, "Expected string for argument at index " +
                                       std::to_string(_index));
    }
    return value.asString(_runtime);
  }

  template <typename T>
  typename std::enable_if<std::is_same<T, jsi::Value>::value, T>::type
  parse(const jsi::Value &value) {
    // For jsi::Value, we need to copy it since we can't just return a reference
    return jsi::Value(_runtime, value);
  }

  template <typename T>
  typename std::enable_if<std::is_same<T, jsi::Object>::value, T>::type
  parse(const jsi::Value &value) {
    if (!value.isObject()) {
      throw jsi::JSError(_runtime, "Expected object for argument at index " +
                                       std::to_string(_index));
    }
    return value.asObject(_runtime);
  }

  template <typename T>
  typename std::enable_if<std::is_same<T, jsi::Array>::value, T>::type
  parse(const jsi::Value &value) {
    if (!value.isObject()) {
      throw jsi::JSError(_runtime, "Expected array for argument at index " +
                                       std::to_string(_index));
    }
    auto obj = value.asObject(_runtime);
    if (!obj.isArray(_runtime)) {
      throw jsi::JSError(_runtime, "Expected array for argument at index " +
                                       std::to_string(_index));
    }
    return obj.asArray(_runtime);
  }

  template <typename T>
  typename std::enable_if<std::is_same<T, jsi::Function>::value, T>::type
  parse(const jsi::Value &value) {
    if (!value.isObject()) {
      throw jsi::JSError(_runtime, "Expected function for argument at index " +
                                       std::to_string(_index));
    }
    auto obj = value.asObject(_runtime);
    if (!obj.isFunction(_runtime)) {
      throw jsi::JSError(_runtime, "Expected function for argument at index " +
                                       std::to_string(_index));
    }
    return obj.asFunction(_runtime);
  }

  // For enum types (cast from number)
  template <typename T>
  typename std::enable_if<std::is_enum<T>::value, T>::type
  parse(const jsi::Value &value) {
    if (!value.isNumber()) {
      throw jsi::JSError(_runtime,
                         "Expected number (enum) for argument at index " +
                             std::to_string(_index));
    }
    return static_cast<T>(static_cast<int>(value.asNumber()));
  }
};

} // namespace RNSkia
