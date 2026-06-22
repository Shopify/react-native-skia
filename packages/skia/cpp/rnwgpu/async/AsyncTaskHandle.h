#pragma once

#include <functional>
#include <memory>
#include <mutex>
#include <optional>
#include <string>

#include <jsi/jsi.h>

namespace rnwgpu {
class Promise;
}

namespace rnwgpu::async {

class RuntimeContext;

/**
 * Represents a pending asynchronous WebGPU operation that can be converted into
 * a JavaScript Promise.
 *
 * In the ProcessEvents model the resolve/reject callbacks are invoked on the
 * owning runtime's own thread (synchronously from instance.ProcessEvents()
 * during the RuntimeContext tick, or synchronously from postTask), so the
 * Promise is settled directly without any thread marshalling.
 */
class AsyncTaskHandle {
public:
  struct State;

  using ValueFactory =
      std::function<facebook::jsi::Value(facebook::jsi::Runtime &)>;
  using ResolveFunction = std::function<void(ValueFactory)>;
  using RejectFunction = std::function<void(std::string)>;

  AsyncTaskHandle();

  /**
   * Internal constructor used by RuntimeContext.
   */
  explicit AsyncTaskHandle(std::shared_ptr<State> state);

  bool valid() const;

  ResolveFunction createResolveFunction() const;
  RejectFunction createRejectFunction() const;

  void attachPromise(const std::shared_ptr<rnwgpu::Promise> &promise) const;

  static AsyncTaskHandle create(const std::shared_ptr<RuntimeContext> &context,
                                bool keepPumping);

private:
  std::shared_ptr<State> _state;
};

} // namespace rnwgpu::async
