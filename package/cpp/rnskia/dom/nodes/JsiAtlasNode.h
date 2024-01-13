#pragma once

#include "AtlasProps.h"
#include "SkImageProps.h"
#include "JsiDomDrawingNode.h"

#include <memory>

namespace RNSkia {

class JsiAtlasNode : public JsiDomDrawingNode,
                     public JsiDomNodeCtor<JsiAtlasNode> {
public:
    explicit JsiAtlasNode(std::shared_ptr<RNSkPlatformContext> context)
        : JsiDomDrawingNode(context, "skAtlas") {}

protected:
    void draw(DrawingContext *context) override {
        if (_atlasProp->isSet() && _imageProp->isSet()) {
            auto [rects, xforms] = _atlasProp->getDerivedValue();
            context->getCanvas()->drawAtlas(
                _imageProp->getDerivedValue(),
                xforms.data(),
                rects.data(),
                nullptr, // colors, optional
                rects.size(),
                SkBlendMode::kSrcOver, // You can replace or modify blend mode as needed
                nullptr, // optional SkPaint
                nullptr  // optional SkRect cullRect
            );
        }
    }

    void defineProperties(NodePropsContainer *container) override {
        JsiDomDrawingNode::defineProperties(container);
        _atlasProp = container->defineProperty<AtlasProp>("atlas");
        _imageProp = container->defineProperty<ImageProp>("image");

        _atlasProp->require();
        _imageProp->require();
    }

private:
    AtlasProp *_atlasProp;
    ImageProp *_imageProp;
};

} // namespace RNSkia
