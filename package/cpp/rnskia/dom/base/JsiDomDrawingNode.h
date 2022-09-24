

#pragma once

#include "JsiDomRenderNode.h"

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
  virtual void draw(std::shared_ptr<JsiBaseDrawingContext> context) = 0;
  
  void renderNode(std::shared_ptr<JsiBaseDrawingContext> context) override {
    // TODO: Update drawing context based on paint prop which can be a few
    // different things.
    
    // For now just call draw
    draw(context);
  }
  
  virtual void onPropsSet(jsi::Runtime &runtime, std::shared_ptr<JsiDomNodeProps> props) override {
    JsiDomRenderNode::onPropsSet(runtime, props);    
  }
  
  virtual void onPropsChanged(std::shared_ptr<JsiDomNodeProps> props) override {
    JsiDomRenderNode::onPropsChanged(props);    
  }
};

}
