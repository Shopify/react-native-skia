#pragma once

#include <memory>
#include <unordered_map>

#include "include/core/SkSurface.h"

namespace RNSkia {


class SurfaceRegistry {
  std::unordered_map<int, sk_sp<SkSurface>> _registry;

public:
  void addSurface(const int contextId, sk_sp<SkSurface> &surface) {
    _registry[contextId] = surface;
  }
  sk_sp<SkSurface> getSurface(const int contextId) {
    return _registry[contextId];
  }
  void removeSurface(const int contextId) { _registry.erase(contextId); }
};

} // namespace RNSkia