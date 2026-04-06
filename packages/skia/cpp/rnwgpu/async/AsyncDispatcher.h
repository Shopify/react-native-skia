#pragma once

#include <functional>
#include <memory>

#include <jsi/jsi.h>

namespace rnwgpu::async {

namespace jsi = facebook::jsi;

/**
 * Abstract dispatcher used by the AsyncRunner to enqueue work back onto the
 * JavaScript thread.
 */
class AsyncDispatcher {
public:
  using Work = std::function<void(jsi::Runtime &)>;

  virtual ~AsyncDispatcher() = default;

  /**
   * Enqueue a unit of work that will be executed on the JavaScript thread.
   */
  virtual void post(Work work) = 0;
};

} // namespace rnwgpu::async
