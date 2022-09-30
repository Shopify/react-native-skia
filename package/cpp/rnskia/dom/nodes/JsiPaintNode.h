#pragma once

#include "JsiDomDeclarationNode.h"
#include "PaintProp.h"
#include "JsiSkRect.h"

namespace RNSkia {

class JsiPaintNode :
public JsiDomDeclarationNode<std::shared_ptr<SkPaint>>,
public JsiDomNodeCtor<JsiPaintNode> {
public:
  JsiPaintNode(std::shared_ptr <RNSkPlatformContext> context) :
    JsiDomDeclarationNode(context, "skPaint") {
    _paintProp = addProperty(std::make_shared<PaintProp>());
    _opacityProp = addProperty(std::make_shared<JsiProp>(PropNameOpacity, PropType::Number));
  }
  
  std::shared_ptr<SkPaint> materialize(JsiBaseDrawingContext* context) override {
    // Since the paint props uses parent paint, we need to set it before we call onPropsChanged
    _paintProp->setParentPaint(context->getPaint());
    
    auto props = getProperties();
    if (props != nullptr) {
      
      // Make sure we commit any waiting transactions in the props object
      props->commitTransactions();
      
      // Make sure we update any properties that were changed in sub classes so that
      // they can update any derived values
      if (props->getHasPropChanges()) {
        onPropsChanged(props);
        props->resetPropChanges();
      }
    }
    
    return _paintProp->getDerivedValue();
  }  
  
private:
  std::shared_ptr <SkRect> _rect;
  std::shared_ptr<PaintProp> _paintProp;
  std::shared_ptr<JsiProp> _opacityProp;
};

}
