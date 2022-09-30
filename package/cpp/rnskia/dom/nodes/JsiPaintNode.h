#pragma once

#include "JsiDomDeclarationNode.h"
#include "PaintProp.h"
#include "JsiSkRect.h"

namespace RNSkia {

class JsiPaintNode :
public JsiDomDeclarationNode<std::shared_ptr<SkPaint>>,
public JsiDomNodeCtor<JsiPaintNode> {
public:
  JsiPaintNode(std::shared_ptr <RNSkPlatformContext> context,
               jsi::Runtime &runtime,
               const jsi::Value *arguments,
               size_t count) :
  JsiDomDeclarationNode(context, runtime, arguments, count, "skPaint"),
  _paintProp(std::make_unique<PaintProp>()),
  _opacityProp(std::make_unique<JsiProp>(PropNameOpacity, PropType::Number)) {}
  
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
  
protected:
  virtual void onPropsChanged(JsiDomNodeProps* props) override {
    JsiDomNode::onPropsChanged(props);
    
    _paintProp->updatePropValues(props);
    _opacityProp->updatePropValues(props);
  }
  
  virtual void onPropsSet(jsi::Runtime &runtime, JsiDomNodeProps* props) override {
    JsiDomNode::onPropsSet(runtime, props);
    
    _paintProp->setProps(runtime, props);
    _opacityProp->setProps(runtime, props);
  }
  
private:
  std::shared_ptr <SkRect> _rect;
  std::unique_ptr<PaintProp> _paintProp;
  std::unique_ptr<JsiProp> _opacityProp;
};

}
