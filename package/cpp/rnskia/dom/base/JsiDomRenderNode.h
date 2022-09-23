
#pragma once

#include "JsiDomNode.h"
#include "JsiDrawingContext.h"

namespace RNSkia {

static std::string PropNameMatrix = "matrix";
static std::string PropNameTransform = "transform";
static std::string PropNameOrigin = "origin";

class JsiDomRenderNode: public JsiDomNode {
public:
  JsiDomRenderNode(std::shared_ptr<RNSkPlatformContext> context,
                   jsi::Runtime& runtime,
                   const jsi::Value *arguments,
                   size_t count):
  JsiDomNode(context, runtime, arguments, count) {}
  
  JSI_HOST_FUNCTION(render) {
    // Get drawing context
    render(std::make_shared<JsiDrawingContextWrapper>(runtime, arguments, count));
    return jsi::Value::undefined();
  }
    
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiDomNode, setProp),
                       JSI_EXPORT_FUNC(JsiDomNode, addChild),
                       JSI_EXPORT_FUNC(JsiDomNode, removeChild),
                       JSI_EXPORT_FUNC(JsiDomNode, insertChildBefore),
                       JSI_EXPORT_FUNC(JsiDomNode, setProps),
                       JSI_EXPORT_FUNC(JsiDomNode, dispose),
                       JSI_EXPORT_FUNC(JsiDomNode, isNative),
                       JSI_EXPORT_FUNC(JsiDomNode, children),
                       JSI_EXPORT_FUNC(JsiDomRenderNode, render))
  
  void render(std::shared_ptr<JsiBaseDrawingContext> context) {
    auto props = getProperties();
    if(props == nullptr) {
      // A node might have an empty set of properties - then we can just render the node directly
      renderNode(context);
      return;
    }
    
    if(props->getIsDirty() && props->hasValue(PropNameTransform)) {
      
      _transformMatrix.setIdentity();
      assert(_transformMatrix.isIdentity());
      SkPoint origin;
      
      auto hasOrigin = props->hasValue(PropNameOrigin);
      if(hasOrigin) {
        origin = props->processPoint(props->getValue(PropNameOrigin));
        _transformMatrix.preTranslate(origin.x(), origin.y());
      }
      
      processTransformProp(_transformMatrix, props->getValue(PropNameTransform));
      
      if(hasOrigin) {
        _transformMatrix.preTranslate(-origin.x(), -origin.y());
      }
    }
    
    bool shouldSave = props->hasValue(PropNameMatrix) || props->hasValue(PropNameTransform);
    
    if(shouldSave) {
      auto matrix = props->hasValue(PropNameMatrix) ?
        *std::dynamic_pointer_cast<JsiSkMatrix>(props->getValue(PropNameMatrix)->getAsHostObject())->getObject() :
        _transformMatrix;
      
      context->getCanvas()->save();
      context->getCanvas()->concat(matrix);
    }
      
    renderNode(context);
      
    if(shouldSave) {
      context->getCanvas()->restore();
    }
    
    props->markClean();
  };
  
  static void processTransformProp(SkMatrix& m, std::shared_ptr<JsiValue> prop) {
    for(auto &el: prop->getAsArray()) {
      auto keys = el->getKeys();
      if(keys.size() == 0) {
        throw std::runtime_error("Empty value in transform. Expected translateX, translateY, scale, "
                                 "scaleX, scaleY, skewX, skewY, rotate or rotateZ.");
      }
      auto key = el->getKeys().at(0);
      auto value = el->getValue(key)->getAsNumber();
      if (key == "translateX") {
        m.preTranslate(value, 0);
      } else if (key == "translateY") {
        m.preTranslate(0, value);
      } else if (key == "scale") {
        m.preScale(value, value);
      } else if (key == "scaleX") {
        m.preScale(value, 1);
      } else if (key == "scaleY") {
        m.preScale(1, value);
      } else if (key == "skewX") {
        m.preScale(value, 0);
      } else if (key == "skewY") {
        m.preScale(value, 0);
      } else if (key == "rotate" || key == "rotateZ") {
        m.preRotate(SkRadiansToDegrees(value));
      } else {
        throw std::runtime_error("Unknown key in transform. Expected translateX, translateY, scale, "
                                 "scaleX, scaleY, skewX, skewY, rotate or rotateZ - got " + key + ".");
      }
    }
  }
  
protected:
  void onPropsRead(jsi::Runtime &runtime) override {
    
    getProperties()->tryReadHostObjectProperty(runtime, PropNameMatrix);
    getProperties()->tryReadArrayProperty(runtime, PropNameTransform);
    try {
      getProperties()->tryReadObjectProperty(runtime, PropNameOrigin);
    } catch(...) {
      getProperties()->tryReadHostObjectProperty(runtime, PropNameOrigin);
    }
  }
  
  virtual void renderNode(std::shared_ptr<JsiBaseDrawingContext> context) = 0;
  
private:
  SkMatrix _transformMatrix;
};

}
