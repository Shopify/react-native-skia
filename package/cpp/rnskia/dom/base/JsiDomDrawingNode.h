

#pragma once

#include "JsiDomRenderNode.h"
#include "JsiPaintNode.h"

namespace RNSkia {

class JsiDomDrawingNode : public JsiDomRenderNode {
public:
  JsiDomDrawingNode(std::shared_ptr<RNSkPlatformContext> context,
                    jsi::Runtime &runtime,
                    const jsi::Value *arguments,
                    size_t count) :
  JsiDomRenderNode(context, runtime, arguments, count) {}
  
protected:
  /**
   Override to implement drawing.
   */
  virtual void draw(JsiBaseDrawingContext* context) = 0;
  
  void renderNode(JsiBaseDrawingContext* context) override {
    // TODO: Handle paint property and swap with context if necessary
    
    
    // Handle paint node as children
    auto paint = context->getPaint();
    for (auto &child: getChildren()) {
      auto paintNode = std::dynamic_pointer_cast<JsiPaintNode>(child);
      if (paintNode != nullptr) {
        paint = paintNode->materialize(context);
      }
    }
    
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
