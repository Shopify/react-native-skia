

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
    _paintProp = container->defineProperty(std::make_shared<PaintProp>());
  }
  
  /**
   Override to implement drawing.
   */
  virtual void draw(DrawingContext* context) = 0;
  
  void renderNode(DrawingContext* context) override {
    // TODO: Handle paint property and swap with context if necessary
    // like in the JS implementation:
    /*
     if (this.props.paint && isSkPaint(this.props.paint)) {
           this.draw({ ...ctx, paint: this.props.paint });
         } else if (this.props.paint && this.props.paint.current != null) {
           this.draw({ ...ctx, paint: this.props.paint.current.materialize() });
         } else {
           this.draw(ctx);
         }
     */
    
    draw(context);
  }
private:
  std::shared_ptr<PaintProp> _paintProp;
};

}
