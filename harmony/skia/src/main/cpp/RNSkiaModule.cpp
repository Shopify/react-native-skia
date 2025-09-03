/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "RNSkiaModule.h"
#include "RNOH/ArkTSTurboModule.h"
#include "SkiaManager.h"
#include <fstream>
#include "RNOH/RNInstance.h"
#include <window_manager/oh_display_manager.h>

using namespace facebook;
using namespace react;

namespace rnoh {

bool RNSkiaModule::install(jsi::Runtime &rt) {
    DLOG(INFO) << "RNSkiaModule::install";
    float pixelDensity = 3.25;
    OH_NativeDisplayManager_GetDefaultDisplayDensityPixels(&pixelDensity);
    DLOG(INFO)<<"DensityPixels==" << pixelDensity;

    platformContext = std::make_shared<RNSkia::HarmonyPlatformContext>(&rt, jsInvoker_, pixelDensity);
    if (!m_ctx.instance.expired()) {
        auto rnInstance = m_ctx.instance.lock();
        auto nativeResourceManager = rnInstance->getNativeResourceManager();
        platformContext->setNativeResourceManager(nativeResourceManager);
        
        platformContext->_instance = rnInstance;
        platformContext->_TurboModule = rnInstance->getTurboModule("RNSkiaModule");
    }
    RNSkia::SkiaManager::getInstance().setContext(platformContext);
    rNSkManager = std::make_shared<RNSkia::RNSkManager>(&rt, jsInvoker_, platformContext);
    RNSkia::SkiaManager::getInstance().setManager(rNSkManager);

    DLOG(INFO) << "RNSkiaModule::install finish.";
    return true;
}

static jsi::Value __hostFunction_RNSkiaInstallModule_install(jsi::Runtime &rt, react::TurboModule &turboModule,
                                                             const jsi::Value *args, size_t count) {
    auto self = static_cast<RNSkiaModule *>(&turboModule);
    self->install(rt);
    return true;
};

RNSkiaModule::RNSkiaModule(const ArkTSTurboModule::Context ctx, const std::string name) : ArkTSTurboModule(ctx, name) {
    methodMap_["install"] = MethodMetadata{0, __hostFunction_RNSkiaInstallModule_install};
}
} // namespace rnoh
