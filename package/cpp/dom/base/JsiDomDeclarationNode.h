
#pragma once

#include "JsiDomNode.h"

namespace RNSkia {

class JsiDomDeclarationNode: public JsiDomNode {
public:
  JsiDomDeclarationNode(std::shared_ptr<RNSkPlatformContext> context,
                        jsi::Runtime& runtime,
                        const jsi::Value *arguments,
                        size_t count):
  JsiDomNode(context, runtime, arguments, count) {}
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiDomNode, setProp),
                       JSI_EXPORT_FUNC(JsiDomNode, getProp),
                       JSI_EXPORT_FUNC(JsiDomNode, addChild),
                       JSI_EXPORT_FUNC(JsiDomNode, removeChild),
                       JSI_EXPORT_FUNC(JsiDomNode, insertChildBefore),
                       JSI_EXPORT_FUNC(JsiDomNode, setProps),
                       JSI_EXPORT_FUNC(JsiDomNode, isNative),
                       JSI_EXPORT_FUNC(JsiDomNode, dispose))
  
protected:
  
};

}
