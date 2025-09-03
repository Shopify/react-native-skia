/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#pragma once

#include <ReactCommon/TurboModule.h>
#include "HarmonyPlatformContext.h"
#include "RNOH/ArkTSTurboModule.h"
#include "RNSkManager.h"

using namespace facebook;
namespace rnoh {
class JSI_EXPORT RNSkiaModule : public ArkTSTurboModule {

public:
    RNSkiaModule(const ArkTSTurboModule::Context ctx, const std::string name);
    bool install(jsi::Runtime &rt);

private:
    std::shared_ptr<RNSkia::HarmonyPlatformContext> platformContext;
    std::shared_ptr<RNSkia::RNSkManager> rNSkManager;
};
} // namespace rnoh
