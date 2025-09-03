/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "SkiaManager.h"
#include <utility>

namespace RNSkia {

void SkiaManager::setContext(std::shared_ptr<RNSkia::HarmonyPlatformContext> context) { platformContext = context; };

std::shared_ptr<RNSkia::HarmonyPlatformContext> SkiaManager::getContext() { return platformContext; }

void SkiaManager::setManager(std::shared_ptr<RNSkia::RNSkManager> manager) { rnSkManager = manager; };

std::shared_ptr<RNSkia::RNSkManager> SkiaManager::getManager() { return rnSkManager; };

} // namespace RNSkia