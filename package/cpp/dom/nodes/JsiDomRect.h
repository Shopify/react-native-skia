#pragma once

#include "JsiDomNode.h"
#include "jsi.h"

namespace RNSkia {

class JsiDomRect: public JsiDomNode {
public:
  JsiDomRect(std::shared_ptr<RNSkPlatformContext> context,
             jsi::Runtime& runtime,
             const jsi::Value *arguments,
             size_t count): JsiDomNode(context, runtime, arguments, count) {
  }
  
  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      auto rectNode = std::make_shared<JsiDomRect>(context, runtime, arguments, count);
      return jsi::Object::createFromHostObject(runtime, std::move(rectNode));
    };
  }
  
protected:
  void setProp(jsi::Runtime &runtime, const std::string key, const jsi::Value &value) override {
    
  }
};

}
