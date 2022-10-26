#pragma once

#include "JsiSkRRect.h"
#include "NodeProp.h"

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
 Reads a rect from a given propety in the node. The name of the property is
 provided on the constructor. The property can either be a Javascript property
 or a host object representing an SkRect.
 */
class RRectProp : public DerivedProp<SkRRect> {
public:
  RRectProp(PropId name) : DerivedProp() {
    _prop = addProperty(std::make_shared<NodeProp>(name));
  }

  void updateDerivedValue() override {
    if (_prop->isSet()) {
      // Check for JsiSkRRect
      if (_prop->value()->getType() == PropType::HostObject) {
        // Try reading as rect
        auto rectPtr = std::dynamic_pointer_cast<JsiSkRRect>(
            _prop->value()->getAsHostObject());
        if (rectPtr != nullptr) {
          auto rrect = rectPtr->getObject();
          setDerivedValue(SkRRect::MakeRectXY(
              SkRect::MakeXYWH(rrect->rect().x(), rrect->rect().y(),
                               rrect->rect().width(), rrect->rect().height()),
              rrect->getSimpleRadii().x(), rrect->getSimpleRadii().y()));
        }
      } else {
        if (_prop->isSet() && _prop->value()->getType() == PropType::Object) {
          auto p = _prop->value();
          if (p->hasValue(PropNameX) && p->hasValue(PropNameY) &&
              p->hasValue(PropNameWidth) && p->hasValue(PropNameHeight) &&
              p->hasValue(PropNameRx) && p->hasValue(PropNameRy)) {
            auto x = _prop->value()->getValue(PropNameX);
            auto y = _prop->value()->getValue(PropNameY);
            auto width = _prop->value()->getValue(PropNameWidth);
            auto height = _prop->value()->getValue(PropNameHeight);
            auto rx = _prop->value()->getValue(PropNameRx);
            auto ry = _prop->value()->getValue(PropNameRy);

            // Update cache from js object value
            setDerivedValue(SkRRect::MakeRectXY(
                SkRect::MakeXYWH(x->getAsNumber(), y->getAsNumber(),
                                 width->getAsNumber(), height->getAsNumber()),
                rx->getAsNumber(), ry->getAsNumber()));
          }
        }
      }
    }
  }

private:
  NodeProp *_prop;
};

/**
 Reads rect properties from a node's properties
 */
class RRectPropFromProps : public DerivedProp<SkRRect> {
public:
  RRectPropFromProps() : DerivedProp<SkRRect>() {
    _x = addProperty(std::make_shared<NodeProp>(PropNameX));
    _y = addProperty(std::make_shared<NodeProp>(PropNameY));
    _width = addProperty(std::make_shared<NodeProp>(PropNameWidth));
    _height = addProperty(std::make_shared<NodeProp>(PropNameHeight));
    _r = addProperty(std::make_shared<NodeProp>(PropNameR));
  }

  void updateDerivedValue() override {
    if (_x->isSet() && _y->isSet() && _width->isSet() && _height->isSet() &&
        _r->isSet()) {
      setDerivedValue(SkRRect::MakeRectXY(
          SkRect::MakeXYWH(
              _x->value()->getAsNumber(), _y->value()->getAsNumber(),
              _width->value()->getAsNumber(), _height->value()->getAsNumber()),
          _r->value()->getAsNumber(), _r->value()->getAsNumber()));
    }
  }

private:
  NodeProp *_x;
  NodeProp *_y;
  NodeProp *_width;
  NodeProp *_height;
  NodeProp *_r;
};

/**
 Reads rect props from either a given property or from the property object
 itself.
 */
class RRectProps : public DerivedProp<SkRRect> {
public:
  RRectProps(PropId name) : DerivedProp<SkRRect>() {
    _rectProp = addProperty<RRectProp>(std::make_shared<RRectProp>(name));
    _rectPropFromProps =
        addProperty<RRectPropFromProps>(std::make_shared<RRectPropFromProps>());
  }

  void updateDerivedValue() override {
    if (_rectProp->isSet()) {
      setDerivedValue(_rectProp->getDerivedValue());
    } else if (_rectPropFromProps->isSet()) {
      setDerivedValue(_rectPropFromProps->getDerivedValue());
    } else {
      setDerivedValue(nullptr);
    }
  }

private:
  RRectProp *_rectProp;
  RRectPropFromProps *_rectPropFromProps;
};
} // namespace RNSkia
