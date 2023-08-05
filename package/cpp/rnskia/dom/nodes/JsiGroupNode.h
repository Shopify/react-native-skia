
#pragma once

#include "JsiDomRenderNode.h"

#include <memory>

namespace RNSkia {

class JsiGroupNode : public JsiDomRenderNode,
                     public JsiDomNodeCtor<JsiGroupNode> {
public:
  explicit JsiGroupNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiDomRenderNode(context, "skGroup") {}

  void renderNode(DrawingContext *context) override {
    for (auto &child : getChildren()) {
      if (child->getNodeClass() == NodeClass::RenderNode) {
        static_cast<JsiDomRenderNode *>(child.get())->render(context);
      }
    }
  }
};

} // namespace RNSkia
