#pragma once

#include <jsi/jsi.h>

#include <memory>

namespace RNJsi {

namespace jsi = facebook::jsi;

/**
 * Listener interface that allows for getting notified when a jsi::Runtime
 * instance is destroyed.
 */
struct RuntimeLifecycleListener {
  virtual ~RuntimeLifecycleListener() {}
  virtual void onRuntimeDestroyed(jsi::Runtime *) = 0;
};

/**
 * This class provides an API via static methods for registering and
 * unregistering runtime lifecycle listeners. The listeners can be used to
 * cleanup any data that references a given jsi::Runtime instance before it gets
 * destroyed.
 */
struct RuntimeLifecycleMonitor {
  static void addListener(jsi::Runtime &rt, RuntimeLifecycleListener *listener);
  static void removeListener(jsi::Runtime &rt,
                             RuntimeLifecycleListener *listener);
};

/**
 * Provides a way to keep data specific to a jsi::Runtime instance that gets
 * cleaned up when that runtime is destroyed. This is necessary because JSI does
 * not allow for its associated objects to be retained past the runtime
 * lifetime. If an object (e.g. jsi::Values or jsi::Function instances) is kept
 * after the runtime is torn down, its destructor (once it is destroyed
 * eventually) will result in a crash (JSI objects keep a pointer to memory
 * managed by the runtime, accessing that portion of the memory after runtime is
 * deleted is the root cause of that crash).
 *
 * In order to provide an efficient implementation that does not add an overhead
 * for the cases when only a single runtiome is used, which is the primary
 * usecase, the following assumptions has been made: 1) The store keeps track of
 * at most two runtime instances 2) Only for the second runtime we track its
 * destruction and clean up the store associated with that runtime. For the
 * first runtime we assume that the object holding the store is destroyed prior
 * to the destruction of that runtime.
 *
 * The above assumptions make it work without any overhead when only single
 * runtime is in use. Specifically, we don't perform any additional operaations
 * related to tracking runtime lifecycle when only a single runtime is used.
 */
template <typename StoreType>
class JsiRuntimeAwareStore : public RuntimeLifecycleListener {

private:
  jsi::Runtime *_primaryRuntime = nullptr, *_secondaryRuntime = nullptr;
  std::unique_ptr<StoreType> _primaryStore, _secondaryStore;

public:
  void onRuntimeDestroyed(jsi::Runtime *rt) override {
    if (_primaryRuntime == rt) {
      _primaryRuntime = _secondaryRuntime;
      _secondaryRuntime = nullptr;
      _primaryStore = nullptr;
      _primaryStore.swap(_secondaryStore);
    } else if (_secondaryRuntime == rt) {
      _secondaryRuntime = nullptr;
      _secondaryStore = nullptr;
    }
  }

  ~JsiRuntimeAwareStore() {
    if (_secondaryRuntime != nullptr) {
      RuntimeLifecycleMonitor::removeListener(*_secondaryRuntime, this);
    }
  }

  StoreType &get(jsi::Runtime &rt) {
    if (_primaryRuntime == &rt) {
      return *_primaryStore;
    } else if (_primaryRuntime == nullptr) {
      _primaryRuntime = &rt;
      _primaryStore = std::make_unique<StoreType>();
      return *_primaryStore;
    } else if (_secondaryRuntime == &rt) {
      return *_secondaryStore;
    } else if (_secondaryStore == nullptr) {
      _secondaryRuntime = &rt;
      _secondaryStore = std::make_unique<StoreType>();
      // we only add listener when the secondary runtime is used, this assumes
      // that the secondary runtime is terminated first. This lets us avoid
      // additional complexity for the majority of cases when objects are not
      // shared between runtimes. Otherwise we'd have to register all objecrts
      // with the RuntimeMonitor as opposed to only registering ones that are
      // used in secondary runtime. Note that we can't register listener here
      // with the primary runtime as it may run on a separate thread.
      RuntimeLifecycleMonitor::addListener(rt, this);
      return *_secondaryStore;
    } else {
      // we don't support more than two stores
      throw std::runtime_error(
          "RuntimeAwareStore supports up to two separate JSI runtimes");
    }
  }
};

} // namespace RNJsi
