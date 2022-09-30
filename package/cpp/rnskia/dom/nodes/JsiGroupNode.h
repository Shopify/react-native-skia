
#pragma once

#include "JsiDomRenderNode.h"

namespace RNSkia {

class JsiGroupNode :
public JsiDomRenderNode,
public JsiDomNodeCtor<JsiGroupNode> {
public:
  JsiGroupNode(std::shared_ptr<RNSkPlatformContext> context) :
    JsiDomRenderNode(context, "skGroup") {}
  
protected:
  void renderNode(JsiBaseDrawingContext* context) override {
    for (auto &child: getChildren()) {
      auto node = std::static_pointer_cast<JsiDomRenderNode>(child);
      if (node != nullptr) {
        node->render(context);
      }
    }
  }
  
private:
  SkRect _rect;
};

}
