/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "RNOH/Package.h"

namespace rnoh {
class SkiaPackage : public Package {

public:
    explicit SkiaPackage(Package::Context ctx) : Package(ctx) {}

    std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactoryDelegate() override;
    std::vector<facebook::react::ComponentDescriptorProvider> createComponentDescriptorProviders() override;
    ComponentJSIBinderByString createComponentJSIBinderByName() override;
    ComponentNapiBinderByString createComponentNapiBinderByName() override;
};

} // namespace rnoh
