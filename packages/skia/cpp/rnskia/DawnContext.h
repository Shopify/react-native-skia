#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "dawn/dawn_proc.h"
#include "dawn/native/DawnNative.h"

#include "include/gpu/graphite/Context.h"
#include "include/gpu/graphite/ContextOptions.h"
#include "include/gpu/graphite/dawn/DawnTypes.h"
#include "include/gpu/graphite/dawn/DawnUtils.h"
#include "include/private/base/SkOnce.h"

namespace RNSkia {
    class DawnContext {
        static std::unique_ptr<DawnContext> Make(wgpu::BackendType backend, bool useTintIR) {
            static std::unique_ptr<dawn::native::Instance> sInstance;
            static SkOnce sOnce;
			return nullptr; 
        }
    };
} // namespace RNSkia
