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
 * ever bound to, until JS retires it; a target JS retires while a context still
 * holds it stays the target of its id until that context lets go of it. A
 * reload clears the registry, as native ids start over with the next bundle
 * (see ~RNSkManager). The same ownership as the SurfaceRegistry of
 * react-native-webgpu.
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
    return entry.owned;
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
    return entry.owned;
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
      target = std::move(it->second.owned);
      _entries.erase(it);
    }
    // The target, and the GPU resources of its queue, may be destroyed here,
    // outside of the lock.
  }

  /**
   Retires the entry from the JS side, when the view component unmounts,
   unless a view bound to it: that entry is the view's, and its teardown
   retires it. React's StrictMode simulates an unmount without unmounting
   the native views, which would otherwise orphan a bound view, and it can
   do so before the view binds while the component goes on with the context
   it made: a target a context still holds therefore stays the id's.
   */
  void removeIfUnbound(size_t nativeId) {
    std::shared_ptr<Target> target;
    {
      std::lock_guard<std::mutex> lock(_mutex);
      auto it = _entries.find(nativeId);
      if (it == _entries.end() || it->second.bound) {
        return;
      }
      target = std::move(it->second.owned);
      if (target.use_count() == 1) {
        _entries.erase(it);
      }
    }
    // Released here, outside of the lock, unless a context holds it.
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
    // Null once JS retired the entry while a context held the target.
    std::shared_ptr<Target> owned;
    std::weak_ptr<Target> target;
    bool bound = false;
  };

  Entry &getOrCreateLocked(size_t nativeId,
                           const std::shared_ptr<Context> &context) {
    eraseReleasedLocked();
    auto it = _entries.find(nativeId);
    if (it != _entries.end()) {
      auto &entry = it->second;
      if (entry.owned == nullptr) {
        entry.owned = entry.target.lock();
      }
      if (entry.owned != nullptr) {
        return entry;
      }
      _entries.erase(it);
    }
    auto target = std::make_shared<Target>(context);
    return _entries.emplace(nativeId, Entry{target, target}).first->second;
  }

  // Retired entries whose target every context has let go of.
  void eraseReleasedLocked() {
    for (auto it = _entries.begin(); it != _entries.end();) {
      if (it->second.owned == nullptr && it->second.target.expired()) {
        it = _entries.erase(it);
      } else {
        ++it;
      }
    }
  }

  std::mutex _mutex;
  std::unordered_map<size_t, Entry> _entries;
};

} // namespace RNSkia
