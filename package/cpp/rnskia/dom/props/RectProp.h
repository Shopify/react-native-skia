#pragma once

#include "JsiDomNodeProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkRect.h>

#pragma clang diagnostic pop

namespace RNSkia {

static const char* PropNameRect = "rect";
static PropId PropNameWidth = JsiPropId::get("width");
static PropId PropNameHeight = JsiPropId::get("height");

/**
 Reads a rect from a given propety in the node. The name of the property is provided on the constructor.
 The property can either be a Javascript property or a host object representing an SkRect.
 */
class RectProp:
public JsiDerivedDomNodeProp<SkRect> {
public:
  RectProp(PropId name):
  JsiDerivedDomNodeProp() {
    _prop = addChildProp(std::make_shared<JsiObjectDomNodeProp>(name));
  }
  
  void updateDerivedValue(JsiDomNodeProps* props) override {
    if (_prop->hasValue() && props->getHasPropChanges(_prop->getName())) {
      // Check for JsiSkRect and JsiSkPoint
      if(_prop->getPropValue()->getType() == PropType::HostObject) {
        // Try reading as rect
        auto rectPtr = std::dynamic_pointer_cast<JsiSkRect>(_prop->getPropValue()->getAsHostObject());
        if (rectPtr == nullptr) {
          throw std::runtime_error("Could not read rect from unknown host object type.");
        }
        setDerivedValue(SkRect::MakeXYWH(rectPtr->getObject()->x(), rectPtr->getObject()->y(),
                                rectPtr->getObject()->width(), rectPtr->getObject()->height()));
      } else {
        // Update cache from js object value
        setDerivedValue(SkRect::MakeXYWH(_x->getAsNumber(), _y->getAsNumber(),
                                         _width->getAsNumber(), _height->getAsNumber()));
      }
    }
  }
  
  void setProps(jsi::Runtime &runtime, JsiDomNodeProps* props) override {
    JsiDerivedDomNodeProp::setProps(runtime, props);
    
    if (_prop->hasValue() && _prop->getPropValue()->getType() == PropType::Object) {
      // Save props for fast access
      _x = _prop->getPropValue()->getValue(PropNameX);
      _y = _prop->getPropValue()->getValue(PropNameY);
      _width = _prop->getPropValue()->getValue(PropNameWidth);
      _height = _prop->getPropValue()->getValue(PropNameHeight);
    }
  }
  
private:
  std::shared_ptr<JsiValue> _x;
  std::shared_ptr<JsiValue> _y;
  std::shared_ptr<JsiValue> _width;
  std::shared_ptr<JsiValue> _height;
  std::shared_ptr<JsiObjectDomNodeProp> _prop;
};

/**
 Reads rect properties from a node's properties
 */
class JsiDomNodeRectPropFromProps:
public JsiDerivedDomNodeProp<SkRect> {
public:
  JsiDomNodeRectPropFromProps():
  JsiDerivedDomNodeProp<SkRect>() {
    _x = addChildProp(std::make_shared<JsiDomNodeProp>(PropNameX, PropType::Number));
    _y = addChildProp(std::make_shared<JsiDomNodeProp>(PropNameY, PropType::Number));
    _width = addChildProp(std::make_shared<JsiDomNodeProp>(PropNameWidth, PropType::Number));
    _height = addChildProp(std::make_shared<JsiDomNodeProp>(PropNameHeight, PropType::Number));
  }
  
  void updateDerivedValue(JsiDomNodeProps* props) {
    if(_x->hasValue() && _y->hasValue() && _width->hasValue() && _height->hasValue()) {
      setDerivedValue(SkRect::MakeXYWH(_x->getPropValue()->getAsNumber(),
                              _y->getPropValue()->getAsNumber(),
                              _width->getPropValue()->getAsNumber(),
                              _height->getPropValue()->getAsNumber()));
    }
  }
  
private:
  std::shared_ptr<JsiDomNodeProp> _x;
  std::shared_ptr<JsiDomNodeProp> _y;
  std::shared_ptr<JsiDomNodeProp> _width;
  std::shared_ptr<JsiDomNodeProp> _height;
};

/**
 Reads rect props from either a given property or from the property object itself.
 */
class JsiDomNodeRectProps:
  public JsiDerivedDomNodeProp<SkRect> {
public:
  JsiDomNodeRectProps(PropId name):
    JsiDerivedDomNodeProp<SkRect>() {
    _rectProp = addChildProp<RectProp>(std::make_shared<RectProp>(name));
    _rectPropFromProps = addChildProp<JsiDomNodeRectPropFromProps>(std::make_shared<JsiDomNodeRectPropFromProps>());
  }
    
  void updateDerivedValue(JsiDomNodeProps* props) override {
    if (_rectProp->hasValue()) {
      setDerivedValue(_rectProp->getDerivedValue());
    } else if (_rectPropFromProps->hasValue()) {
      setDerivedValue(_rectPropFromProps->getDerivedValue());
    } else {
      throw std::runtime_error("Either the rect property or x/y/width/height must be set.");
    }
  }

private:
  std::shared_ptr<RectProp> _rectProp;
  std::shared_ptr<JsiDomNodeRectPropFromProps> _rectPropFromProps;
};
}
