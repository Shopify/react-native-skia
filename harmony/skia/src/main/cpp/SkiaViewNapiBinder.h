/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#pragma once
#include <react/renderer/core/PropsParserContext.h>
#include "RNOHCorePackage/ComponentBinders/ViewComponentNapiBinder.h"

#include "SkiaDomViewComponentDescriptor.h"
#include "SkiaPictureViewComponentDescriptor.h"


namespace rnoh {

class SkiaDomViewNapiBinder : public ViewComponentNapiBinder {
public:
    napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) override {
        napi_value napiViewProps = ViewComponentNapiBinder::createProps(env, shadowView);
        auto propsObjBuilder = ArkJS(env).getObjectBuilder(napiViewProps);
        if (auto props = std::dynamic_pointer_cast<const facebook::react::SkiaDomViewProps>(shadowView.props)) {

            propsObjBuilder.addProperty("mode", props->mode).addProperty("debug", props->debug);

            return propsObjBuilder.build();
        }

        return napiViewProps;
    };
};

class SkiaPictureViewNapiBinder : public ViewComponentNapiBinder {
public:
    napi_value createProps(napi_env env, facebook::react::ShadowView const shadowView) override {
        napi_value napiViewProps = ViewComponentNapiBinder::createProps(env, shadowView);
        auto propsObjBuilder = ArkJS(env).getObjectBuilder(napiViewProps);
        if (auto props = std::dynamic_pointer_cast<const facebook::react::SkiaPictureViewProps>(shadowView.props)) {

            propsObjBuilder.addProperty("mode", props->mode).addProperty("debug", props->debug);

            return propsObjBuilder.build();
        }

        return napiViewProps;
    };
};
} // namespace rnoh