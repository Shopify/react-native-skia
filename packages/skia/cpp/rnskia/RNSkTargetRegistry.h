#pragma once

#include <cstddef>
#include <memory>
#include <mutex>
#include <unordered_map>
#include <utility>

namespace RNSkia {

/**
 * Targets by native view id, kept apart from what a target is so that the
 * ownership can be tested on its own (RNSkGraphiteTargetRegistry is the one in
 * use). The registry owns every target. An entry is made by whichever side
 * comes first, the context JS makes for the id or the view binding to it, and
 * kept until the platform view of the id is unregistered or, for an id no view
 * ever bound to, until JS retires it. A reload clears the registry, as native
 * ids start over with the next bundle (see ~RNSkManager). The same ownership
 * as the SurfaceRegistry of react-native-webgpu.
 */
template <typename Target, typename Context> class RNSkTargetRegistry {
public:
  RNSkTargetRegistry() = default;
  RNSkTargetRegistry(const RNSkTargetRegistry &) = delete;
  RNSkTargetRegistry &operator=(const RNSkTargetRegistry &) = delete;

  /** The target of the id, for the context JS makes; made when missing. */
  std::shared_ptr<Target> getOrCreate(size_t nativeId,
                                      const std::shared_ptr<Context> &context) {
    std::lock_guard<std::mutex> lock(_mutex);
    auto &entry = getOrCreateLocked(nativeId, context);
    return entry.target;
  }

  /**
   The target of the id, for the view binding to it; made when missing. From
   here on the entry is the view's: its unregistration retires it, not JS
   (see removeIfUnbound). Made and marked under one lock, so that a removal
   racing with the bind either finds the entry bound or runs before it is
   made again.
   */
  std::shared_ptr<Target> bind(size_t nativeId,
                               const std::shared_ptr<Context> &context) {
    std::lock_guard<std::mutex> lock(_mutex);
    auto &entry = getOrCreateLocked(nativeId, context);
    entry.bound = true;
    return entry.target;
  }

  /** Retires the entry of a platform view that is gone. */
  void remove(size_t nativeId) {
    std::shared_ptr<Target> target;
    {
      std::lock_guard<std::mutex> lock(_mutex);
      auto it = _entries.find(nativeId);
      if (it == _entries.end()) {
        return;
      }
      target = std::move(it->second.target);
      _entries.erase(it);
    }
    // The target, and the GPU resources of its queue, may be destroyed here,
    // outside of the lock.
  }

  /**
   Retires the entry from the JS side, when the view component unmounts,
   unless a view bound to it: that entry is the view's, and its teardown
   retires it. React's StrictMode simulates an unmount without unmounting
   the native views, which would otherwise orphan a bound view.
   */
  void removeIfUnbound(size_t nativeId) {
    std::shared_ptr<Target> target;
    {
      std::lock_guard<std::mutex> lock(_mutex);
      auto it = _entries.find(nativeId);
      if (it == _entries.end() || it->second.bound) {
        return;
      }
      target = std::move(it->second.target);
      _entries.erase(it);
    }
  }

  /** Drops every entry: the bundle is going away (see ~RNSkManager). */
  void clear() {
    std::unordered_map<size_t, Entry> entries;
    {
      std::lock_guard<std::mutex> lock(_mutex);
      entries.swap(_entries);
    }
  }

private:
  struct Entry {
    std::shared_ptr<Target> target;
    bool bound = false;
  };

  Entry &getOrCreateLocked(size_t nativeId,
                           const std::shared_ptr<Context> &context) {
    auto it = _entries.find(nativeId);
    if (it != _entries.end()) {
      return it->second;
    }
    return _entries.emplace(nativeId, Entry{std::make_shared<Target>(context)})
        .first->second;
  }

  std::mutex _mutex;
  std::unordered_map<size_t, Entry> _entries;
};

} // namespace RNSkia
