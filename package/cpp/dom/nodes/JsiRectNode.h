#pragma once

#include "JsiDomRenderNode.h"
#include "jsi.h"

#include "JsiSkRect.h"

namespace RNSkia {

class JsiRectNode: public JsiDomRenderNode {
public:
  JsiRectNode(std::shared_ptr<RNSkPlatformContext> context,
             jsi::Runtime& runtime,
             const jsi::Value *arguments,
             size_t count):
  JsiDomRenderNode(context, runtime, arguments, count) {}
  
  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      auto rectNode = std::make_shared<JsiRectNode>(context, runtime, arguments, count);
      return jsi::Object::createFromHostObject(runtime, std::move(rectNode));
    };
  }
  
protected:
  void setProp(jsi::Runtime &runtime, const std::string key, const jsi::Value &value) override {
    JsiDomRenderNode::setProp(runtime, key, value);
    // FIXME: Handle processing of rect props
    if(key == "rect") {
      _rect = JsiSkRect::fromValue(runtime, value);
    }
  }
  
  void render(std::shared_ptr<JsiDrawingContext> context) override {
    context->getCanvas()->drawRect(*_rect.get(), *context->getPaint());
  }
  
  // FIXME: Add to enum and sync with JS somehow?
  const char* getType() override { return "skRect"; }
  
private:
  std::shared_ptr<SkRect> _rect;
};

}
