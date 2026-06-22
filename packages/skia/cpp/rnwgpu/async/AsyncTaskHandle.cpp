#include "AsyncTaskHandle.h"

#include <memory>
#include <string>
#include <utility>

#include <ReactCommon/CallInvoker.h>

#include "jsi2/Promise.h"

#include "RuntimeContext.h"

namespace rnwgpu::async {

using Action = std::function<void(jsi::Runtime &, rnwgpu::Promise &)>;

struct AsyncTaskHandle::State
    : public std::enable_shared_from_this<AsyncTaskHandle::State> {
  State(std::shared_ptr<RuntimeContext> context, bool keepPumping)
      : context(std::move(context)), keepPumping(keepPumping) {}

  void settle(Action action);
  void attachPromise(const std::shared_ptr<rnwgpu::Promise> &promise);
  void schedule(Action action);

  ResolveFunction createResolveFunction();
  RejectFunction createRejectFunction();

  std::shared_ptr<rnwgpu::Promise> currentPromise();

  std::mutex mutex;
  std::shared_ptr<RuntimeContext> context;
  bool keepPumping;
  std::shared_ptr<rnwgpu::Promise> promise;
  std::optional<Action> pendingAction;
  bool settled = false;
  std::shared_ptr<State> keepAlive;
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
  auto promiseRef = currentPromise();
  if (!promiseRef) {
    return;
  }

  if (!context) {
    // No context (shouldn't happen): best-effort inline settle.
    action(promiseRef->runtime, *promiseRef);
    std::lock_guard<std::mutex> lock(mutex);
    keepAlive.reset();
    return;
  }

  auto self = shared_from_this();

  if (!keepPumping) {
    // Spontaneous task (e.g. device.lost): not driven by the ProcessEvents pump.
    // Settle on the owning runtime's JS thread via its CallInvoker, which is
    // wired only for the main JS runtime. A device created on a worklet runtime
    // has no invoker, so its device.lost is dropped (best-effort; see the
    // Threading model). invokeAsync runs the closure on the main JS thread,
    // where promiseRef->runtime lives for a main-runtime device.
    auto invoker = context->callInvoker();
    if (invoker) {
      invoker->invokeAsync(
          [self, action = std::move(action), promiseRef]() mutable {
            action(promiseRef->runtime, *promiseRef);
            std::lock_guard<std::mutex> lock(self->mutex);
            self->keepAlive.reset();
          });
    } else {
      std::lock_guard<std::mutex> lock(mutex);
      keepAlive.reset();
    }
    return;
  }

  // Pumping task (request/response op). The resolve/reject callback may fire on
  // a thread that is NOT the owning runtime's thread: with a shared
  // wgpu::Instance, another runtime's ProcessEvents() pump can consume this Dawn
  // event. Touching the Promise's runtime off-thread would corrupt Hermes. So we
  // deposit the actual settle (the only JSI-touching work) into the owning
  // context's mailbox; the context drains it on its own thread during its next
  // tick. The deposited closure captures only C++ state and runs no JSI until
  // drained, so depositing from any thread is safe.
  context->postSettle(
      [self, action = std::move(action), promiseRef]() mutable {
        action(promiseRef->runtime, *promiseRef);
        if (self->context) {
          self->context->onTaskSettled(/*keepPumping=*/true);
        }
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
AsyncTaskHandle::create(const std::shared_ptr<RuntimeContext> &context,
                        bool keepPumping) {
  auto state = std::make_shared<State>(context, keepPumping);
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
