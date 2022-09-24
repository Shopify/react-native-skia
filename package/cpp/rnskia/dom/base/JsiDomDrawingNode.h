

#pragma once

#include "JsiDomRenderNode.h"
#include "ContextProcessor.h"

namespace RNSkia {

class JsiDomDrawingNode : public JsiDomRenderNode {
public:
  JsiDomDrawingNode(std::shared_ptr<RNSkPlatformContext> context,
                    jsi::Runtime &runtime,
                    const jsi::Value *arguments,
                    size_t count) :
  JsiDomRenderNode(context, runtime, arguments, count) {}
  
protected:
  virtual void draw(std::shared_ptr<JsiBaseDrawingContext> context) = 0;
  
  void renderNode(std::shared_ptr<JsiBaseDrawingContext> context) override {
    if (_contextChanged) {
      _contextChanged = false;
      _childContext = ContextProcessor::processContext(context, getProperties());
    }
    
    draw(std::make_shared<JsiDrawingContext>(context->getCanvas(),
                                             _childContext->getPaint(),
                                             _childContext->getOpacity()));
  }
  
  virtual void onPropsSet(jsi::Runtime &runtime, std::shared_ptr<JsiDomNodeProps> props) override {
    JsiDomRenderNode::onPropsSet(runtime, props);
    
    getProperties()->tryReadStringProperty(runtime, PropNameColor);
    getProperties()->tryReadStringProperty(runtime, PropNameStyle);
    getProperties()->tryReadNumericProperty(runtime, PropNameStrokeWidth);
    getProperties()->tryReadNumericProperty(runtime, PropNameOpacity);
    
    _contextChanged = true;
  }
  
  virtual void onPropsChanged(std::shared_ptr<JsiDomNodeProps> props) override {
    JsiDomRenderNode::onPropsChanged(props);
    
    _contextChanged = true;
  }
  
private:
  std::shared_ptr<JsiBaseDrawingContext> _childContext;
  bool _contextChanged = true;
};

}
