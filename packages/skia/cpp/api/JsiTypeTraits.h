#pragma once

#include <optional>

namespace RNSkia {

// Common type traits used across JSI argument parsing and conversion systems
template <typename T> struct is_optional : std::false_type {};
template <typename T> struct is_optional<std::optional<T>> : std::true_type {};

template <typename T> struct unwrap_optional {
  using type = T;
};

template <typename T> struct unwrap_optional<std::optional<T>> {
  using type = T;
};

} // namespace RNSkia