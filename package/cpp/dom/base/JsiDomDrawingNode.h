

#pragma once

#include "JsiDomRenderNode.h"


namespace RNSkia {

class JsiDomDrawingNode: public JsiDomRenderNode {
public:
  JsiDomDrawingNode(std::shared_ptr<RNSkPlatformContext> context,
                    jsi::Runtime& runtime,
                    const jsi::Value *arguments,
                    size_t count):
  JsiDomRenderNode(context, runtime, arguments, count) {}
    
  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiDomNode, children))
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiDomNode, setProp),
                       JSI_EXPORT_FUNC(JsiDomNode, dispose))
};

}
