

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
  virtual void draw(JsiBaseDrawingContext* context) = 0;
  
  void renderNode(JsiBaseDrawingContext* context) override {
    draw(context);
  }
  
  virtual void onPropsSet(jsi::Runtime &runtime, JsiDomNodeProps* props) override {
    JsiDomRenderNode::onPropsSet(runtime, props);    
  }
  
  virtual void onPropsChanged(JsiDomNodeProps* props) override {
    JsiDomRenderNode::onPropsChanged(props);    
  }
};

}
