#include "JsiSkDispatcher.h"

namespace RNSkia {

// Thread-local storage definition
thread_local std::shared_ptr<Dispatcher::DispatcherData>
    Dispatcher::_threadDispatcher;

} // namespace RNSkia