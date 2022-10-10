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
public DerivedProp<SkRect> {
public:
  RectProp(PropId name):
  DerivedProp() {
    _prop = addProperty(std::make_shared<NodeProp>(name));
  }
  
  void updateDerivedValue() override {
    if (_prop->hasValue()) {
      // Check for JsiSkRect
      if(_prop->getValue()->getType() == PropType::HostObject) {
        auto rectPtr = std::dynamic_pointer_cast<JsiSkRect>(_prop->getValue()->getAsHostObject());
        if (rectPtr != nullptr) {
          setDerivedValue(SkRect::MakeXYWH(rectPtr->getObject()->x(), rectPtr->getObject()->y(),
                                           rectPtr->getObject()->width(), rectPtr->getObject()->height()));
        }
      } else {
        // Update cache from js object value
        if (_x != nullptr && _y != nullptr && _width != nullptr && _height != nullptr) {
          setDerivedValue(SkRect::MakeXYWH(_x->getAsNumber(), _y->getAsNumber(),
                                           _width->getAsNumber(), _height->getAsNumber()));
        }
      }
    }
  }
  
  void onValueRead() override {
    DerivedProp::onValueRead();
    
    if (_prop->hasValue() && _prop->getValue()->getType() == PropType::Object) {
      auto p = _prop->getValue();
      if (p->hasValue(PropNameX) &&
          p->hasValue(PropNameY) &&
          p->hasValue(PropNameWidth) &&
          p->hasValue(PropNameHeight)) {
        // Save props for fast access
        _x = _prop->getValue()->getValue(PropNameX);
        _y = _prop->getValue()->getValue(PropNameY);
        _width = _prop->getValue()->getValue(PropNameWidth);
        _height = _prop->getValue()->getValue(PropNameHeight);
      }
    }
  }
  
private:
  std::shared_ptr<JsiValue> _x;
  std::shared_ptr<JsiValue> _y;
  std::shared_ptr<JsiValue> _width;
  std::shared_ptr<JsiValue> _height;
  NodeProp* _prop;
};

/**
 Reads rect properties from a node's properties
 */
class RectPropFromProps:
public DerivedProp<SkRect> {
public:
  RectPropFromProps():
  DerivedProp<SkRect>() {
    _x = addProperty(std::make_shared<NodeProp>(PropNameX));
    _y = addProperty(std::make_shared<NodeProp>(PropNameY));
    _width = addProperty(std::make_shared<NodeProp>(PropNameWidth));
    _height = addProperty(std::make_shared<NodeProp>(PropNameHeight));
  }
  
  void updateDerivedValue() override {
    if(_x->hasValue() && _y->hasValue() && _width->hasValue() && _height->hasValue()) {
      setDerivedValue(SkRect::MakeXYWH(_x->getValue()->getAsNumber(),
                              _y->getValue()->getAsNumber(),
                              _width->getValue()->getAsNumber(),
                              _height->getValue()->getAsNumber()));
    }
  }
  
private:
  NodeProp* _x;
  NodeProp* _y;
  NodeProp* _width;
  NodeProp* _height;
};

/**
 Reads rect props from either a given property or from the property object itself.
 */
class RectProps:
  public DerivedProp<SkRect> {
public:
  RectProps(PropId name):
    DerivedProp<SkRect>() {
    _rectProp = addProperty(std::make_shared<RectProp>(name));
    _rectPropFromProps = addProperty(std::make_shared<RectPropFromProps>());
  }
    
  void updateDerivedValue() override {
    if (_rectProp->hasValue()) {
      setDerivedValue(_rectProp->getDerivedValue());
    } else if (_rectPropFromProps->hasValue()) {
      setDerivedValue(_rectPropFromProps->getDerivedValue());
    } else {
      setDerivedValue(nullptr);
    }
  }

private:
  RectProp* _rectProp;
  RectPropFromProps* _rectPropFromProps;
};
}
