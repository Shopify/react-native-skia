#include "AsyncTaskHandle.h"

#include <string>
#include <utility>

#include "Promise.h"

#include "AsyncRunner.h"

namespace rnwgpu::async {

using Action = std::function<void(jsi::Runtime &, rnwgpu::Promise &)>;

struct AsyncTaskHandle::State
    : public std::enable_shared_from_this<AsyncTaskHandle::State> {
  State(std::shared_ptr<AsyncRunner> runner, bool keepPumping)
      : runner(std::move(runner)), keepPumping(keepPumping) {}

  void settle(Action action);
  void attachPromise(const std::shared_ptr<rnwgpu::Promise> &promise);
  void schedule(Action action);

  ResolveFunction createResolveFunction();
  RejectFunction createRejectFunction();

  std::shared_ptr<rnwgpu::Promise> currentPromise();

  std::mutex mutex;
  std::weak_ptr<AsyncRunner> runner;
  std::shared_ptr<rnwgpu::Promise> promise;
  std::optional<Action> pendingAction;
  bool settled = false;
  std::shared_ptr<State> keepAlive;
  bool keepPumping;
};

// MARK: - State helpers

void AsyncTaskHandle::State::settle(Action action) {
  std::optional<Action> actionToSchedule;

  {
    std::lock_guard<std::mutex> lock(mutex);
    if (settled) {
      return;
    }
    settled = true;

    if (promise) {
      actionToSchedule = std::move(action);
    } else {
      pendingAction = std::move(action);
    }
  }

  if (actionToSchedule.has_value()) {
    schedule(std::move(*actionToSchedule));
  }
}

void AsyncTaskHandle::State::attachPromise(
    const std::shared_ptr<rnwgpu::Promise> &newPromise) {
  std::optional<Action> actionToSchedule;
  {
    std::lock_guard<std::mutex> lock(mutex);
    promise = newPromise;
    keepAlive = shared_from_this();
    if (pendingAction.has_value()) {
      actionToSchedule = std::move(pendingAction);
      pendingAction.reset();
    }
  }

  if (actionToSchedule.has_value()) {
    schedule(std::move(*actionToSchedule));
  }
}

void AsyncTaskHandle::State::schedule(Action action) {
  auto runnerRef = runner.lock();
  if (!runnerRef) {
    return;
  }

  auto promiseRef = currentPromise();
  if (!promiseRef) {
    runnerRef->onTaskSettled(keepPumping);
    return;
  }

  auto dispatcherRef = runnerRef->dispatcher();
  if (!dispatcherRef) {
    runnerRef->onTaskSettled(keepPumping);
    return;
  }

  dispatcherRef->post([self = shared_from_this(), action = std::move(action),
                       runnerRef, promiseRef](jsi::Runtime &runtime) mutable {
    runnerRef->onTaskSettled(self->keepPumping);
    action(runtime, *promiseRef);
    std::lock_guard<std::mutex> lock(self->mutex);
    self->keepAlive.reset();
  });
}

AsyncTaskHandle::ResolveFunction
AsyncTaskHandle::State::createResolveFunction() {
  auto weakSelf = std::weak_ptr<State>(shared_from_this());
  return [weakSelf](ValueFactory factory) {
    if (auto self = weakSelf.lock()) {
      ValueFactory resolvedFactory =
          factory ? std::move(factory) : [](jsi::Runtime &runtime) {
            return jsi::Value::undefined();
          };
      self->settle(
          [factory = std::move(resolvedFactory)](
              jsi::Runtime &runtime, rnwgpu::Promise &promise) mutable {
            auto value = factory(runtime);
            promise.resolve(std::move(value));
          });
    }
  };
}

AsyncTaskHandle::RejectFunction AsyncTaskHandle::State::createRejectFunction() {
  auto weakSelf = std::weak_ptr<State>(shared_from_this());
  return [weakSelf](std::string reason) {
    if (auto self = weakSelf.lock()) {
      self->settle([reason = std::move(reason)](jsi::Runtime & /*runtime*/,
                                                rnwgpu::Promise &promise) {
        promise.reject(reason);
      });
    }
  };
}

std::shared_ptr<rnwgpu::Promise> AsyncTaskHandle::State::currentPromise() {
  std::lock_guard<std::mutex> lock(mutex);
  return promise;
}

// MARK: - AsyncTaskHandle

AsyncTaskHandle::AsyncTaskHandle() = default;

AsyncTaskHandle::AsyncTaskHandle(std::shared_ptr<State> state)
    : _state(std::move(state)) {}

bool AsyncTaskHandle::valid() const { return _state != nullptr; }

AsyncTaskHandle
AsyncTaskHandle::create(const std::shared_ptr<AsyncRunner> &runner,
                        bool keepPumping) {
  auto state = std::make_shared<State>(runner, keepPumping);
  state->keepAlive = state;
  return AsyncTaskHandle(std::move(state));
}

AsyncTaskHandle::ResolveFunction
AsyncTaskHandle::createResolveFunction() const {
  if (!_state) {
    return [](ValueFactory) {};
  }
  return _state->createResolveFunction();
}

AsyncTaskHandle::RejectFunction AsyncTaskHandle::createRejectFunction() const {
  if (!_state) {
    return [](std::string) {};
  }
  return _state->createRejectFunction();
}

void AsyncTaskHandle::attachPromise(
    const std::shared_ptr<rnwgpu::Promise> &promise) const {
  if (_state) {
    _state->attachPromise(promise);
  }
}

} // namespace rnwgpu::async
