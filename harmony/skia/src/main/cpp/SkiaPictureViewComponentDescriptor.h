/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#pragma once

#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/view/ViewShadowNode.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/core/propsConversions.h>

namespace facebook {
namespace react {

inline const char SkiaPictureViewComponentName[] = "SkiaPictureView";

class SkiaPictureViewProps : public ViewProps {
public:
    SkiaPictureViewProps() = default;

    SkiaPictureViewProps(const PropsParserContext &context, const SkiaPictureViewProps &sourceProps, const RawProps &rawProps)
        : ViewProps(context, sourceProps, rawProps),
          mode(sourceProps.mode),
          debug(sourceProps.debug) {}

    std::string mode{};
    bool debug{true};
};

class SkiaPictureViewEventEmitter : public ViewEventEmitter {
public:
    using ViewEventEmitter::ViewEventEmitter;
};

using SkiaPictureViewShadowNode =
    ConcreteViewShadowNode<SkiaPictureViewComponentName, SkiaPictureViewProps, SkiaPictureViewEventEmitter>;

class SkiaPictureViewComponentDescriptor final : public ConcreteComponentDescriptor<SkiaPictureViewShadowNode> {
public:
    SkiaPictureViewComponentDescriptor(ComponentDescriptorParameters const &parameters)
        : ConcreteComponentDescriptor(parameters) {}
};

} // namespace react
} // namespace facebook
