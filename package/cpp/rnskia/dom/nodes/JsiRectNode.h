#pragma once

#include "JsiDomDrawingNode.h"
#include "RectProcessor.h"
#include "JsiSkRect.h"

namespace RNSkia {

static const char* PropNameRect = "rect";
static const char* RectNodeName = "skRect";

class JsiRectNode : public JsiDomDrawingNode {
public:
  JsiRectNode(std::shared_ptr<RNSkPlatformContext> context,
              jsi::Runtime &runtime,
              const jsi::Value *arguments,
              size_t count) :
  JsiDomDrawingNode(context, runtime, arguments, count),
  _rectProcessor(std::make_unique<RectProcessor>(PropNameRect)) {}
  
  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      auto rectNode = std::make_shared<JsiRectNode>(context, runtime, arguments, count);
      return jsi::Object::createFromHostObject(runtime, std::move(rectNode));
    };
  }
    
protected:
  void onPropsChanged(std::shared_ptr<JsiDomNodeProps> props) override {
    JsiDomDrawingNode::onPropsChanged(props);
    
    _rectProcessor->processRect(props);
  }
  
  void onPropsSet(jsi::Runtime &runtime, std::shared_ptr<JsiDomNodeProps> props) override {
    JsiDomDrawingNode::onPropsSet(runtime, props);
    try {
      props->tryReadObjectProperty(runtime, PropNameRect);
    } catch (...) {
      props->tryReadHostObjectProperty(runtime, PropNameRect);
    }
    props->tryReadNumericProperty(runtime, PropNameX);
    props->tryReadNumericProperty(runtime, PropNameY);
    props->tryReadNumericProperty(runtime, PropNameWidth);
    props->tryReadNumericProperty(runtime, PropNameHeight);
    
    _rectProcessor->onPropsSet(props);
  }
  
  void draw(std::shared_ptr<JsiBaseDrawingContext> context) override {
    context->getCanvas()->drawRect(_rectProcessor->getRect(), *context->getPaint());
  }
  
  const char *getType() override { return RectNodeName; }
  
private:
  std::unique_ptr<RectProcessor> _rectProcessor;
};

}
