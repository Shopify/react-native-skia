#pragma once

#include "JsiHostObject.h"
#include "jsi.h"

#include "RNSkPlatformContext.h"

namespace RNSkia {

class JsiDomNode: public JsiHostObject {
public:
  JsiDomNode(std::shared_ptr<RNSkPlatformContext> context,
             jsi::Runtime& runtime,
             const jsi::Value *arguments,
             size_t count):
  JsiHostObject(),
  _platformContext(context) {
    
  }
    
  JSI_HOST_FUNCTION(setProp) {
    return jsi::Value::undefined();
  }
  
  JSI_HOST_FUNCTION(dispose) {
    return jsi::Value::undefined();
  }
  
  JSI_PROPERTY_GET(children) {
    return jsi::Value::undefined();
  }
  
  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiDomNode, children))
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiDomNode, setProp),
                       JSI_EXPORT_FUNC(JsiDomNode, dispose))
    
protected:
  
  virtual void setProp(jsi::Runtime &runtime, const std::string key, const jsi::Value &value) = 0;
  
  std::shared_ptr<RNSkPlatformContext> getPlatformContext() {
    return _platformContext;
  }
  
private:
  std::shared_ptr<RNSkPlatformContext> _platformContext;
};

}
