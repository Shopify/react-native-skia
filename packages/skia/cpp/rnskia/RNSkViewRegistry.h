#pragma once

#include <algorithm>
#include <atomic>
#include <iterator>
#include <memory>
#include <mutex>
#include <shared_mutex>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "RNSkGraphiteProducer.h"
#include "RNSkView.h"
#include "jsi/ViewProperty.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

/**
 The recording side of a Skia view: what JS hands the view (the recorder of
 a <Canvas>, a picture) and the view it goes to. Either side may come first:
 what JS hands over before the view binds waits here and reaches the view
 when it does; while the view is away (iOS detaches it from its superview)
 it waits again. Held by the JS handle of the view (JsiSkViewHandle) and,
 while a view is bound, by the ViewRegistry, where it is found by id.
 */
class RNSkViewInfo {
public:
  explicit RNSkViewInfo(size_t nativeId) : _nativeId(nativeId) {}

  size_t getNativeId() const { return _nativeId; }

  /** Hands a property to the view, or keeps it for the view to come. */
  void setProperty(const std::string &name, RNJsi::ViewProperty property) {
    std::lock_guard<std::mutex> lock(_mutex);
    _props.insert_or_assign(name, std::move(property));
    flushLocked();
  }

  /** Binds the view and hands it what waited. */
  void bind(std::shared_ptr<RNSkView> view) {
    std::lock_guard<std::mutex> lock(_mutex);
    _view = std::move(view);
    _view->setNativeId(_nativeId);
    flushLocked();
  }

  /** The view is away: what JS hands over from now on waits for the next. */
  void unbind() {
    std::lock_guard<std::mutex> lock(_mutex);
    _view = nullptr;
  }

  std::shared_ptr<RNSkView> getView() {
    std::lock_guard<std::mutex> lock(_mutex);
    return _view;
  }

  /**
   Reads the shared values into the recording and schedules a redraw. Called
   from the Reanimated mapper on every frame; the only things crossing
   runtimes are the view id, the recording id and the shared values. The
   recording is either owned by the view or, until the view binds, waiting
   here. Updates for a recording that is neither (a stale mapper, a view that
   has been torn down) are ignored.
   */
  void applyUpdates(jsi::Runtime &runtime, double recorderId,
                    const jsi::Array &values) {
    std::shared_ptr<RNSkView> view;
    {
      std::lock_guard<std::mutex> lock(_mutex);
      view = _view;
      if (view == nullptr) {
        // The view has not bound yet (or is away): the recording waits and
        // is drawn, with whatever values it holds by then, once a view
        // binds. Keep it current, under the lock so that a bind cannot slip
        // in between; the recording would otherwise wait, unready (it reads
        // no value while recording), until the next change, and the view
        // would show nothing until then.
        auto it = _props.find("recorder");
        if (it != _props.end() && it->second.isRecorder()) {
          RNSkGraphiteProducer::applyUpdatesTo(it->second.getRecorder(),
                                               runtime, recorderId, values);
        }
        return;
      }
    }
    // Outside the lock: the update must not hold up the commits and binds of
    // the view. The view schedules its own frame.
    view->applyUpdates(runtime, recorderId, values);
  }

private:
  void flushLocked() {
    if (_view == nullptr || _props.empty()) {
      return;
    }
    _view->setJsiProperties(_props);
    _props.clear();
  }

  const size_t _nativeId;
  std::mutex _mutex;
  std::shared_ptr<RNSkView> _view;
  std::unordered_map<std::string, RNJsi::ViewProperty> _props;
};

/**
 The views by native id, for the life of the process. An entry is made by
 whichever side comes first, the JS handle (SkiaViewApi.makeViewHandle) or
 the native view binding to the id, and the other side joins it.

 JS writes only ever go through the handle, never by id: one that arrives
 after the view is gone (a mapper racing with the unmount) lands in the
 handle's own entry and dies with it, so there is nothing to recreate and no
 id to tombstone. The calls by id (applyUpdates from the mapper, a redraw, a
 snapshot) find an entry or do nothing.

 An entry lives while JS holds its handle, through a weak reference, and
 while a view is bound to it, through a strong one (bind to remove). An
 entry only JS held is pruned once its handle is gone, so a canvas whose
 view never came leaves nothing behind.
 */
class ViewRegistry {
public:
  static ViewRegistry &getInstance() {
    static ViewRegistry instance;
    return instance;
  }

  ViewRegistry(const ViewRegistry &) = delete;
  ViewRegistry &operator=(const ViewRegistry &) = delete;

  // The id of a view about to mount. Ids are handed out here, once for the
  // life of the process, rather than counted by each JS runtime from the
  // same start: this registry outlives a reload, and the views of the bundle
  // being replaced leave it while the new bundle is already mounting; an id
  // counted from the same start as its predecessor would let the
  // predecessor's teardown remove the entry of a live view (#4312).
  size_t allocateId() { return _nextId.fetch_add(1); }

  /** The entry of the id, made when missing: the JS handle, a view binding. */
  std::shared_ptr<RNSkViewInfo> acquire(size_t id) {
    std::unique_lock<std::shared_mutex> lock(_mutex);
    auto &entry = _entries[id];
    if (entry.bound != nullptr) {
      return entry.bound;
    }
    if (auto info = entry.held.lock()) {
      return info;
    }
    auto info = std::make_shared<RNSkViewInfo>(id);
    entry.held = info;
    pruneLocked();
    return info;
  }

  /** The entry of the id, or null: for the calls by id, which make none. */
  std::shared_ptr<RNSkViewInfo> find(size_t id) {
    std::shared_lock<std::shared_mutex> lock(_mutex);
    auto it = _entries.find(id);
    if (it == _entries.end()) {
      return nullptr;
    }
    return it->second.bound != nullptr ? it->second.bound
                                       : it->second.held.lock();
  }

  std::shared_ptr<RNSkView> getView(size_t id) {
    auto info = find(id);
    return info != nullptr ? info->getView() : nullptr;
  }

  /** Binds the view to the entry of its id, which then lives until remove(). */
  void bind(size_t id, std::shared_ptr<RNSkView> view) {
    auto info = acquire(id);
    info->bind(std::move(view));
    std::unique_lock<std::shared_mutex> lock(_mutex);
    _entries[id].bound = std::move(info);
  }

  /** The view is away (see RNSkViewInfo::unbind); its entry stays. */
  void unbind(size_t id) {
    if (auto info = find(id)) {
      info->unbind();
    }
  }

  /**
   The view is torn down: its entry goes, whether or not JS still holds the
   handle (what the handle is handed from now on stays with it).
   */
  void remove(size_t id) {
    std::shared_ptr<RNSkViewInfo> info;
    {
      std::unique_lock<std::shared_mutex> lock(_mutex);
      auto it = _entries.find(id);
      if (it == _entries.end()) {
        return;
      }
      info = it->second.bound != nullptr ? it->second.bound
                                         : it->second.held.lock();
      _entries.erase(it);
    }
    // A handle JS still holds must not keep the view alive.
    if (info != nullptr) {
      info->unbind();
    }
  }

  // The views bound right now, for a call on each of them outside of the
  // registry lock. Any thread.
  std::vector<std::shared_ptr<RNSkView>> getViews() {
    std::vector<std::shared_ptr<RNSkView>> views;
    std::shared_lock<std::shared_mutex> lock(_mutex);
    views.reserve(_entries.size());
    for (const auto &entry : _entries) {
      if (entry.second.bound == nullptr) {
        continue;
      }
      if (auto view = entry.second.bound->getView()) {
        views.push_back(std::move(view));
      }
    }
    return views;
  }

  /** Drops every entry: the runtime of the handles is going away. */
  void clear() {
    std::unique_lock<std::shared_mutex> lock(_mutex);
    _entries.clear();
    _pruneAt = kMinPruneSize;
  }

private:
  ViewRegistry() = default;

  struct Entry {
    // The claim of the JS handle: the entry is found by id while JS holds it.
    std::weak_ptr<RNSkViewInfo> held;
    // The claim of the bound view, from bind() to remove().
    std::shared_ptr<RNSkViewInfo> bound;
  };

  // An entry whose handle is gone with no view bound is dead. They are
  // dropped once the map has doubled since the last pass, so that an app
  // mounting canvases for hours does not accumulate them. Under the lock.
  void pruneLocked() {
    if (_entries.size() < _pruneAt) {
      return;
    }
    for (auto it = _entries.begin(); it != _entries.end();) {
      bool dead = it->second.bound == nullptr && it->second.held.expired();
      it = dead ? _entries.erase(it) : std::next(it);
    }
    _pruneAt = std::max(kMinPruneSize, _entries.size() * 2);
  }

  static constexpr size_t kMinPruneSize = 64;
  mutable std::shared_mutex _mutex;
  std::unordered_map<size_t, Entry> _entries;
  size_t _pruneAt = kMinPruneSize;
  std::atomic<size_t> _nextId{1000};
};

} // namespace RNSkia
