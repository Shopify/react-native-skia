#include "AsyncRunner.h"

#include <chrono>
#include <stdexcept>
#include <utility>

#include "AsyncTaskHandle.h"

namespace rnwgpu::async {

// Static member definitions
std::mutex AsyncRunner::_runnersMutex;
std::unordered_map<jsi::Runtime *, std::shared_ptr<AsyncRunner>> AsyncRunner::_runners;

AsyncRunner::AsyncRunner(wgpu::Instance instance,
                         std::shared_ptr<AsyncDispatcher> dispatcher)
    : _instance(std::move(instance)), _dispatcher(std::move(dispatcher)),
      _pendingTasks(0), _pumpTasks(0), _tickScheduled(false),
      _lastTickTimeNs(0) {
  if (!_dispatcher) {
    throw std::runtime_error("AsyncRunner requires a valid dispatcher.");
  }
}

std::shared_ptr<AsyncRunner> AsyncRunner::get(jsi::Runtime &runtime) {
  std::lock_guard<std::mutex> lock(_runnersMutex);
  auto it = _runners.find(&runtime);
  if (it == _runners.end()) {
    return nullptr;
  }
  return it->second;
}

std::shared_ptr<AsyncRunner>
AsyncRunner::getOrCreate(jsi::Runtime &runtime, wgpu::Instance instance,
                         std::shared_ptr<AsyncDispatcher> dispatcher) {
  std::lock_guard<std::mutex> lock(_runnersMutex);
  auto it = _runners.find(&runtime);
  if (it != _runners.end()) {
    return it->second;
  }

  auto runner =
      std::make_shared<AsyncRunner>(std::move(instance), std::move(dispatcher));
  _runners[&runtime] = runner;
  return runner;
}

AsyncTaskHandle AsyncRunner::postTask(const TaskCallback &callback,
                                      bool keepPumping) {
  auto handle = AsyncTaskHandle::create(shared_from_this(), keepPumping);
  if (!handle.valid()) {
    throw std::runtime_error("Failed to create AsyncTaskHandle.");
  }

  _pendingTasks.fetch_add(1, std::memory_order_acq_rel);
  if (keepPumping) {
    _pumpTasks.fetch_add(1, std::memory_order_acq_rel);
  }
  requestTick();

  auto resolve = handle.createResolveFunction();
  auto reject = handle.createRejectFunction();

  try {
    callback(resolve, reject);
  } catch (const std::exception &exception) {
    reject(exception.what());
  } catch (...) {
    reject("Unknown native error in AsyncRunner::postTask.");
  }

  return handle;
}

void AsyncRunner::requestTick() {
  bool expected = false;
  if (!_tickScheduled.compare_exchange_strong(expected, true,
                                              std::memory_order_acq_rel)) {
    return;
  }

  auto self = shared_from_this();
  _dispatcher->post([self](jsi::Runtime &runtime) {
    auto tickCallback = jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, "AsyncRunnerTick"), 0,
        [self](jsi::Runtime &runtime, const jsi::Value & /*thisValue*/,
               const jsi::Value * /*args*/, size_t /*count*/) -> jsi::Value {
          self->tick(runtime);
          return jsi::Value::undefined();
        });

#if defined(ANDROID) || defined(__ANDROID__)
    auto global = runtime.global();
    auto setImmediateValue = global.getProperty(runtime, "setImmediate");
    constexpr auto kMinTickInterval = std::chrono::milliseconds(4);
    const int64_t nowNs =
        std::chrono::duration_cast<std::chrono::nanoseconds>(
            std::chrono::steady_clock::now().time_since_epoch())
            .count();
    const int64_t lastNs =
        self->_lastTickTimeNs.load(std::memory_order_acquire);
    int delayMs = 0;
    if (lastNs > 0) {
      const int64_t elapsedNs = nowNs - lastNs;
      const int64_t minIntervalNs = kMinTickInterval.count() * 1000000LL;
      if (elapsedNs < minIntervalNs) {
        const int64_t remainingNs = minIntervalNs - elapsedNs;
        delayMs = static_cast<int>((remainingNs + 999999) / 1000000);
      }
    }

    auto tryScheduleTimeout = [&](int ms) {
      auto setTimeoutValue = global.getProperty(runtime, "setTimeout");
      if (!setTimeoutValue.isObject()) {
        return false;
      }
      auto setTimeoutObj = setTimeoutValue.asObject(runtime);
      if (!setTimeoutObj.isFunction(runtime)) {
        return false;
      }
      auto setTimeoutFn = setTimeoutObj.asFunction(runtime);
      jsi::Value callbackArg(runtime, tickCallback);
      jsi::Value delayArg(static_cast<double>(ms));
      setTimeoutFn.call(runtime, callbackArg, delayArg);
      return true;
    };

    if (delayMs > 0) {
      if (tryScheduleTimeout(delayMs)) {
        return;
      }
      // If setTimeout unavailable fall through to immediate scheduling.
    }

    if (setImmediateValue.isObject()) {
      auto setImmediateObj = setImmediateValue.asObject(runtime);
      if (setImmediateObj.isFunction(runtime)) {
        auto setImmediateFn = setImmediateObj.asFunction(runtime);
        jsi::Value callbackArg(runtime, tickCallback);
        setImmediateFn.call(runtime, callbackArg);
        return;
      }
    }

    int timeoutDelayMs = delayMs > 0 ? delayMs : 0;
    if (tryScheduleTimeout(timeoutDelayMs)) {
      return;
    }

    runtime.queueMicrotask(std::move(tickCallback));
#else
    runtime.queueMicrotask(std::move(tickCallback));
#endif
  });
}

void AsyncRunner::tick(jsi::Runtime & /*runtime*/) {
  _tickScheduled.store(false, std::memory_order_release);
  _instance.ProcessEvents();
  const auto nowNs = std::chrono::duration_cast<std::chrono::nanoseconds>(
                         std::chrono::steady_clock::now().time_since_epoch())
                         .count();
  _lastTickTimeNs.store(nowNs, std::memory_order_release);
  if (_pumpTasks.load(std::memory_order_acquire) > 0) {
    requestTick();
  }
}

void AsyncRunner::onTaskSettled(bool keepPumping) {
  _pendingTasks.fetch_sub(1, std::memory_order_acq_rel);
  if (keepPumping) {
    _pumpTasks.fetch_sub(1, std::memory_order_acq_rel);
  }
}

std::shared_ptr<AsyncDispatcher> AsyncRunner::dispatcher() const {
  return _dispatcher;
}

} // namespace rnwgpu::async
