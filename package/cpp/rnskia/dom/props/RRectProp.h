#pragma once

#include "JsiDomNodeProp.h"
#include "JsiSkRRect.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkRRect.h>
#include <SkRect.h>

#pragma clang diagnostic pop

namespace RNSkia {

static PropId PropNameRx = JsiPropId::get("rx");
static PropId PropNameRy = JsiPropId::get("ry");
static PropId PropNameR = JsiPropId::get("r");

/**
 Reads a rect from a given propety in the node. The name of the property is provided on the constructor.
 The property can either be a Javascript property or a host object representing an SkRect.
 */
class RRectProp:
public JsiDerivedDomNodeProp<SkRRect> {
public:
  RRectProp(PropId name):
  JsiDerivedDomNodeProp() {
    _prop = addChildProp(std::make_shared<JsiObjectDomNodeProp>(name));
  }
  
  void updateDerivedValue(JsiDomNodeProps* props) override {
    if (_prop->hasValue() && props->getHasPropChanges(_prop->getName())) {
      // Check for JsiSkRRect
      if(_prop->getPropValue()->getType() == PropType::HostObject) {
        // Try reading as rect
        auto rectPtr = std::dynamic_pointer_cast<JsiSkRRect>(_prop->getPropValue()->getAsHostObject());
        if (rectPtr == nullptr) {
          throw std::runtime_error("Could not read rounded rect from unknown host object type.");
        }
        auto rrect = rectPtr->getObject();
        setDerivedValue(SkRRect::MakeRectXY(SkRect::MakeXYWH(rrect->rect().x(), rrect->rect().y(),
                                                             rrect->rect().width(), rrect->rect().height()),
                                            rrect->getSimpleRadii().x(), rrect->getSimpleRadii().y()));
      } else {
        // Update cache from js object value
        setDerivedValue(SkRRect::MakeRectXY(SkRect::MakeXYWH(_x->getAsNumber(), _y->getAsNumber(),
                                                             _width->getAsNumber(), _height->getAsNumber()),
                                            _rx->getAsNumber(), _ry->getAsNumber()));
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
      _rx = _prop->getPropValue()->getValue(PropNameRx);
      _ry = _prop->getPropValue()->getValue(PropNameRy);
    }
  }
  
private:
  std::shared_ptr<JsiValue> _x;
  std::shared_ptr<JsiValue> _y;
  std::shared_ptr<JsiValue> _width;
  std::shared_ptr<JsiValue> _height;
  std::shared_ptr<JsiValue> _rx;
  std::shared_ptr<JsiValue> _ry;
  std::shared_ptr<JsiObjectDomNodeProp> _prop;
};

/**
 Reads rect properties from a node's properties
 */
class JsiDomNodeRRectPropFromProps:
public JsiDerivedDomNodeProp<SkRRect> {
public:
  JsiDomNodeRRectPropFromProps():
  JsiDerivedDomNodeProp<SkRRect>() {
    _x = addChildProp(std::make_shared<JsiDomNodeProp>(PropNameX, PropType::Number));
    _y = addChildProp(std::make_shared<JsiDomNodeProp>(PropNameY, PropType::Number));
    _width = addChildProp(std::make_shared<JsiDomNodeProp>(PropNameWidth, PropType::Number));
    _height = addChildProp(std::make_shared<JsiDomNodeProp>(PropNameHeight, PropType::Number));
    _r = addChildProp(std::make_shared<JsiDomNodeProp>(PropNameR, PropType::Number));
  }
  
  void updateDerivedValue(JsiDomNodeProps* props) {
    if(_x->hasValue() && _y->hasValue() && _width->hasValue() && _height->hasValue() && _r->hasValue()) {
      setDerivedValue(SkRRect::MakeRectXY(SkRect::MakeXYWH(_x->getPropValue()->getAsNumber(),
                                                           _y->getPropValue()->getAsNumber(),
                                                           _width->getPropValue()->getAsNumber(),
                                                           _height->getPropValue()->getAsNumber()),
                                          _r->getPropValue()->getAsNumber(), _r->getPropValue()->getAsNumber()));
    }
  }
  
private:
  std::shared_ptr<JsiDomNodeProp> _x;
  std::shared_ptr<JsiDomNodeProp> _y;
  std::shared_ptr<JsiDomNodeProp> _width;
  std::shared_ptr<JsiDomNodeProp> _height;
  std::shared_ptr<JsiDomNodeProp> _r;
};

/**
 Reads rect props from either a given property or from the property object itself.
 */
class JsiDomNodeRRectProps:
  public JsiDerivedDomNodeProp<SkRRect> {
public:
  JsiDomNodeRRectProps(PropId name):
    JsiDerivedDomNodeProp<SkRRect>() {
    _rectProp = addChildProp<RRectProp>(std::make_shared<RRectProp>(name));
    _rectPropFromProps = addChildProp<JsiDomNodeRRectPropFromProps>(std::make_shared<JsiDomNodeRRectPropFromProps>());
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
  std::shared_ptr<RRectProp> _rectProp;
  std::shared_ptr<JsiDomNodeRRectPropFromProps> _rectPropFromProps;
};
}

