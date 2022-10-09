

#pragma once

#include "JsiDomRenderNode.h"
#include "JsiPaintNode.h"

namespace RNSkia {

class JsiDomDrawingNode : public JsiDomRenderNode {
public:
  JsiDomDrawingNode(std::shared_ptr<RNSkPlatformContext> context,
                    const char* type) :
  JsiDomRenderNode(context, type) {}
  
protected:
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomRenderNode::defineProperties(container);
    container->defineProperty(std::make_shared<PaintProp>());
  }
  
  /**
   Override to implement drawing.
   */
  virtual void draw(DrawingContext* context) = 0;
  
  void renderNode(DrawingContext* context) override {
    // Handle paint property and swap with context if necessary
    // like in the JS implementation - this is done automatically by
    // the paint prop itself.
    /*
     if (this.props.paint && isSkPaint(this.props.paint)) {
           this.draw({ ...ctx, paint: this.props.paint });
         } else if (this.props.paint && this.props.paint.current != null) {
           this.draw({ ...ctx, paint: this.props.paint.current.materialize() });
         } else {
           this.draw(ctx);
         }
     */
    JsiDomRenderNode::renderNode(context);
    draw(context);
  }
};

}
