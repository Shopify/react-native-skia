

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
  /**
   Override to implement drawing.
   */
  virtual void draw(JsiBaseDrawingContext* context) = 0;
  
  void renderNode(JsiBaseDrawingContext* context) override {
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
    
    
    // Handle paint node as children
    auto paint = context->getPaint();
    for (auto &child: getChildren()) {
      auto paintNode = std::dynamic_pointer_cast<JsiPaintNode>(child);
      if (paintNode != nullptr) {
        paint = paintNode->materializeNode(context);
      }
    }
    
    // Ensure cached context
    if (_context == nullptr) {
      _context = std::make_shared<JsiDrawingContext>(context);
    }
    
    _context->setCanvas(context->getCanvas());
    _context->setPaint(paint);
    _context->setOpacity(context->getOpacity());
    
    draw(_context.get());
  }
  
  virtual void onPropsSet(jsi::Runtime &runtime, JsiDomNodeProps* props) override {
    JsiDomRenderNode::onPropsSet(runtime, props);    
  }
  
  virtual void onPropsChanged(JsiDomNodeProps* props) override {
    JsiDomRenderNode::onPropsChanged(props);    
  }
  
private:
  std::shared_ptr<JsiDrawingContext> _context;
};

}
