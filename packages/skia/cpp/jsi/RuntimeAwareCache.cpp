#include "RuntimeAwareCache.h"

namespace RNJsi {

std::atomic<jsi::Runtime *> BaseRuntimeAwareCache::_mainRuntime{nullptr};

} // namespace RNJsi
