#pragma once

#include "JsiDomDeclarationNode.h"
#include "jsi.h"

#include "JsiSkRect.h"

namespace RNSkia {

class JsiPaintNode: public JsiDomDeclarationNode {
public:
  JsiPaintNode(std::shared_ptr<RNSkPlatformContext> context,
             jsi::Runtime& runtime,
             const jsi::Value *arguments,
             size_t count):
  JsiDomDeclarationNode(context, runtime, arguments, count) {}
  
  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      auto rectNode = std::make_shared<JsiRectNode>(context, runtime, arguments, count);
      return jsi::Object::createFromHostObject(runtime, std::move(rectNode));
    };
  }
  
protected:
  void setProp(jsi::Runtime &runtime, const std::string key, const jsi::Value &value) override {
    JsiDomDeclarationNode::setProp(runtime, key, value);    
  }
  
  // FIXME: Add to enum and sync with JS somehow?
  const char* getType() override { return "skPaint"; }
  
private:
  std::shared_ptr<SkRect> _rect;
};

}
