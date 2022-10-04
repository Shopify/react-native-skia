#pragma once

#include "NodeProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkRect.h>

#pragma clang diagnostic pop

namespace RNSkia {

static PropId PropNameRect = JsiPropId::get("rect");
static PropId PropNameWidth = JsiPropId::get("width");
static PropId PropNameHeight = JsiPropId::get("height");

/**
 Reads a rect from a given propety in the node. The name of the property is provided on the constructor.
 The property can either be a Javascript property or a host object representing an SkRect.
 */
class RectProp:
public JsiDerivedProp<SkRect> {
public:
  RectProp(PropId name):
  JsiDerivedProp() {
    _prop = addChildProp(std::make_shared<JsiObjectProp>(name));
  }
  
  void updateDerivedValue(NodePropsContainer* props) override {
    if (_prop->hasValue() && props->getHasPropChanges(_prop->getName())) {
      // Check for JsiSkRect
      if(_prop->getPropValue()->getType() == PropType::HostObject) {
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
  
  void setProps(jsi::Runtime &runtime, NodePropsContainer* props) override {
    JsiDerivedProp::setProps(runtime, props);
    
    if (_prop->hasValue() && _prop->getPropValue()->getType() == PropType::Object) {
      auto p = _prop->getPropValue();
      if (p->hasValue(PropNameX) &&
          p->hasValue(PropNameY) &&
          p->hasValue(PropNameWidth) &&
          p->hasValue(PropNameHeight)) {
        // Save props for fast access
        _x = _prop->getPropValue()->getValue(PropNameX);
        _y = _prop->getPropValue()->getValue(PropNameY);
        _width = _prop->getPropValue()->getValue(PropNameWidth);
        _height = _prop->getPropValue()->getValue(PropNameHeight);
      }
    }
  }
  
private:
  std::shared_ptr<JsiValue> _x;
  std::shared_ptr<JsiValue> _y;
  std::shared_ptr<JsiValue> _width;
  std::shared_ptr<JsiValue> _height;
  std::shared_ptr<JsiObjectProp> _prop;
};

/**
 Reads rect properties from a node's properties
 */
class RectPropFromProps:
public JsiDerivedProp<SkRect> {
public:
  RectPropFromProps():
  JsiDerivedProp<SkRect>() {
    _x = addChildProp(std::make_shared<NodeProp>(PropNameX, PropType::Number));
    _y = addChildProp(std::make_shared<NodeProp>(PropNameY, PropType::Number));
    _width = addChildProp(std::make_shared<NodeProp>(PropNameWidth, PropType::Number));
    _height = addChildProp(std::make_shared<NodeProp>(PropNameHeight, PropType::Number));
  }
  
  void updateDerivedValue(NodePropsContainer* props) {
    if(_x->hasValue() && _y->hasValue() && _width->hasValue() && _height->hasValue()) {
      setDerivedValue(SkRect::MakeXYWH(_x->getPropValue()->getAsNumber(),
                              _y->getPropValue()->getAsNumber(),
                              _width->getPropValue()->getAsNumber(),
                              _height->getPropValue()->getAsNumber()));
    }
  }
  
private:
  std::shared_ptr<NodeProp> _x;
  std::shared_ptr<NodeProp> _y;
  std::shared_ptr<NodeProp> _width;
  std::shared_ptr<NodeProp> _height;
};

/**
 Reads rect props from either a given property or from the property object itself.
 */
class RectProps:
  public JsiDerivedProp<SkRect> {
public:
  RectProps(PropId name):
    JsiDerivedProp<SkRect>() {
    _rectProp = addChildProp<RectProp>(std::make_shared<RectProp>(name));
    _rectPropFromProps = addChildProp<RectPropFromProps>(std::make_shared<RectPropFromProps>());
  }
    
  void updateDerivedValue(NodePropsContainer* props) override {
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
  std::shared_ptr<RectPropFromProps> _rectPropFromProps;
};
}
