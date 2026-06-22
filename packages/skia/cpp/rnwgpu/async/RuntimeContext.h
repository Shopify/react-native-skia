#pragma once

#include <atomic>
#include <cstddef>
#include <functional>
#include <memory>
#include <mutex>
#include <vector>

#include <jsi/jsi.h>

#include "AsyncTaskHandle.h"

#include "webgpu/webgpu_cpp.h"

namespace jsi = facebook::jsi;

namespace facebook::react {
class CallInvoker;
} // namespace facebook::react

namespace rnwgpu::async {

/**
 * Per-runtime coordinator for asynchronous WebGPU operations.
 *
 * Each JS runtime that uses WebGPU gets its own RuntimeContext, stored in the
 * runtime's runtimeData. Async Dawn operations are registered with
 * CallbackMode::AllowProcessEvents and driven to completion by pumping
 * `instance.ProcessEvents()` on the runtime's OWN thread via a self-
 * rescheduling tick (scheduled through that runtime's setTimeout). Because
 * ProcessEvents invokes the Dawn callbacks synchronously on the pumping thread,
 * the JS Promise is settled directly on the owning runtime, with no background
 * thread and no cross-thread hop.
 *
 * The pump only runs while at least one "pumping" task is outstanding, so it
 * costs nothing when idle and stops cleanly.
 *
 * Spontaneous events (keepPumping = false): events that may fire at any time,
 * independent of any request/response op (today only GPUDevice::getLost, whose
 * Dawn callback is registered AllowSpontaneous). These are NOT driven by the
 * pump. Instead their settle is marshalled onto the owning runtime's JS thread
 * via that runtime's CallInvoker, which is wired only for the MAIN JS runtime
 * (callInvoker()). A device created on a worklet runtime has no invoker, so its
 * device.lost is best-effort and may never fire.
 *
 * Shared-instance safety (mailbox): multiple runtimes may share one
 * wgpu::Instance. ProcessEvents() drains the whole instance queue and fires
 * callbacks on the calling thread, which may NOT be the owning runtime's thread
 * for a given promise. So a settled callback never touches JSI inline; it
 * deposits a settle-action (a plain C++ closure, no JSI) into the OWNING
 * context's thread-safe mailbox via postSettle(), and each context drains its
 * own mailbox on its own thread during tick(). ProcessEvents() itself is
 * serialized across runtimes by a process-wide mutex, since concurrent
 * ProcessEvents on one instance is not guaranteed reentrant.
 *
 * Threading contract: a RuntimeContext must only be pumped from the runtime it
 * was created for. Create and use a GPUDevice (and the buffers/queues derived
 * from it) on the same runtime that requested the adapter.
 */
class RuntimeContext : public std::enable_shared_from_this<RuntimeContext> {
public:
  using TaskCallback =
      std::function<void(const AsyncTaskHandle::ResolveFunction &,
                         const AsyncTaskHandle::RejectFunction &)>;

  RuntimeContext(jsi::Runtime &runtime, wgpu::Instance instance);

  static std::shared_ptr<RuntimeContext> get(jsi::Runtime &runtime);
  static std::shared_ptr<RuntimeContext> getOrCreate(jsi::Runtime &runtime,
                                                     wgpu::Instance instance);

  // Register the main JS runtime and its CallInvoker. The RuntimeContext created
  // for this runtime gets the invoker (callInvoker() returns it); every other
  // runtime's context returns null. Called once from RNSkManager on install.
  static void
  registerMainRuntime(jsi::Runtime *runtime,
                      std::shared_ptr<facebook::react::CallInvoker> invoker);

  // CallInvoker for this runtime's JS thread, or null. Non-null only for the
  // main JS runtime; used to deliver spontaneous events (device.lost) without
  // the pump. See the class doc.
  const std::shared_ptr<facebook::react::CallInvoker> &callInvoker() const {
    return _callInvoker;
  }

  // The wgpu::Instance bound to this runtime.
  wgpu::Instance instance() const { return _instance; }

  AsyncTaskHandle postTask(const TaskCallback &callback,
                           bool keepPumping = true);

  // Deposit a settle-action to run on THIS context's runtime thread. Thread-safe
  // (callable from any thread, e.g. another runtime that pumped ProcessEvents).
  // The job must not touch JSI until it runs (it runs during drainMailbox on the
  // owning thread).
  void postSettle(std::function<void()> job);

  // Invoked by a drained settle-action when its task settles. Runs on the owning
  // runtime's thread.
  void onTaskSettled(bool keepPumping);

private:
  static jsi::UUID runtimeDataUUID();

  void requestTick();
  void tick();
  void drainMailbox();

  jsi::Runtime &_runtime;
  wgpu::Instance _instance;
  // Non-null only for the main JS runtime's context (see registerMainRuntime).
  std::shared_ptr<facebook::react::CallInvoker> _callInvoker;
  std::atomic<std::size_t> _pumpTasks{0};
  std::atomic<bool> _tickScheduled{false};

  std::mutex _mailboxMutex;
  std::vector<std::function<void()>> _mailbox;
};

} // namespace rnwgpu::async
