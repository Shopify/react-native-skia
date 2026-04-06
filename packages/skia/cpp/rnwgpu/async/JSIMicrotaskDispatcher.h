#pragma once

#include "AsyncDispatcher.h"

namespace rnwgpu::async {

/**
 * Dispatcher implementation backed by `jsi::Runtime::queueMicrotask`.
 */
class JSIMicrotaskDispatcher final
    : public AsyncDispatcher,
      public std::enable_shared_from_this<JSIMicrotaskDispatcher> {
public:
  explicit JSIMicrotaskDispatcher(jsi::Runtime &runtime);

  void post(Work work) override;

private:
  jsi::Runtime &_runtime;
};

} // namespace rnwgpu::async
