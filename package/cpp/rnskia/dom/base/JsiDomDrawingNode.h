#pragma once

#include "JsiDomRenderNode.h"
#include "JsiPaintNode.h"

#include <memory>

namespace RNSkia {

class JsiDomDrawingNode : public JsiDomRenderNode {
public:
  JsiDomDrawingNode(std::shared_ptr<RNSkPlatformContext> context,
                    const char *type)
      : JsiDomRenderNode(context, type) {}

protected:
  void defineProperties(NodePropsContainer *container) override {
    JsiDomRenderNode::defineProperties(container);
    container->defineProperty(std::make_shared<PaintProp>());
  }

  /**
   Override to implement drawing.
   */
  virtual void draw(DrawingContext *context) = 0;

  void renderNode(DrawingContext *context) override {
#if SKIA_DOM_DEBUG
    RNSkLogger::logToConsole("%s%s", getLevelIndentation(context, 1).c_str(),
                             context->getDebugDescription().c_str());
#endif
    draw(context);

    // Draw once more for each child paint node
    for (auto &child : getChildren()) {
      auto ptr = std::dynamic_pointer_cast<JsiPaintNode>(child);
      if (ptr != nullptr) {
        draw(ptr->getDrawingContext());
      }
    }
  }
};

} // namespace RNSkia
