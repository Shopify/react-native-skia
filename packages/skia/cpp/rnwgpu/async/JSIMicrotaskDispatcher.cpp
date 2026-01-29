#include "JSIMicrotaskDispatcher.h"

#include <utility>

namespace rnwgpu::async {

JSIMicrotaskDispatcher::JSIMicrotaskDispatcher(jsi::Runtime &runtime)
    : _runtime(runtime) {}

void JSIMicrotaskDispatcher::post(Work work) {
  auto microtask = jsi::Function::createFromHostFunction(
      _runtime, jsi::PropNameID::forAscii(_runtime, "AsyncMicrotask"), 0,
      [work = std::move(work)](
          jsi::Runtime &runtime, const jsi::Value & /*thisValue*/,
          const jsi::Value * /*args*/, size_t /*count*/) -> jsi::Value {
        work(runtime);
        return jsi::Value::undefined();
      });

  _runtime.queueMicrotask(std::move(microtask));
}

} // namespace rnwgpu::async
