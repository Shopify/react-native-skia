#pragma once

#include "NodeProp.h"
#include "PointProp.h"

#include "RNSkRRectConverter.h"

#include <memory>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkRect.h"

#pragma clang diagnostic pop

namespace RNSkia {

/**
 Reads a rect from a given propety in the node. The name of the property is
 provided on the constructor. The property can either be a Javascript property
 or a host object representing an SkRect.
 */
class RectProp : public DerivedProp<SkRect> {
public:
  explicit RectProp(PropId name,
                    const std::function<void(BaseNodeProp *)> &onChange)
      : DerivedProp(onChange) {
    _prop = defineProperty<NodeProp>(name);
  }

  void updateDerivedValue() override {
    if (_prop->isSet()) {
      setDerivedValue(RNSkRectConverter::convert(_prop->value()));
    }
  }

private:
  NodeProp *_prop;
};

/**
 Reads rect properties from a node's properties
 */
class RectPropFromProps : public DerivedProp<SkRect> {
public:
  explicit RectPropFromProps(
      const std::function<void(BaseNodeProp *)> &onChange)
      : DerivedProp<SkRect>(onChange) {
    _x = defineProperty<NodeProp>(PropNameX);
    _y = defineProperty<NodeProp>(PropNameY);
    _width = defineProperty<NodeProp>(PropNameWidth);
    _height = defineProperty<NodeProp>(PropNameHeight);
  }

  void updateDerivedValue() override {
    if (_width->isSet() && _height->isSet()) {
      auto x = 0.0;
      auto y = 0.0;
      if (_x->isSet()) {
        x = _x->value().getAsNumber();
      }
      if (_y->isSet()) {
        y = _y->value().getAsNumber();
      }
      setDerivedValue(SkRect::MakeXYWH(x, y, _width->value().getAsNumber(),
                                       _height->value().getAsNumber()));
    }
  }

private:
  NodeProp *_x;
  NodeProp *_y;
  NodeProp *_width;
  NodeProp *_height;
};

/**
 Reads rect props from either a given property or from the property object
 itself.
 */
class RectProps : public DerivedProp<SkRect> {
public:
  explicit RectProps(PropId name,
                     const std::function<void(BaseNodeProp *)> &onChange)
      : DerivedProp<SkRect>(onChange) {
    _rectProp = defineProperty<RectProp>(name);
    _rectPropFromProps = defineProperty<RectPropFromProps>();
  }

  void updateDerivedValue() override {
    if (_rectProp->isSet()) {
      setDerivedValue(_rectProp->getUnsafeDerivedValue());
    } else if (_rectPropFromProps->isSet()) {
      setDerivedValue(_rectPropFromProps->getUnsafeDerivedValue());
    } else {
      setDerivedValue(nullptr);
    }
  }

private:
  RectProp *_rectProp;
  RectPropFromProps *_rectPropFromProps;
};
} // namespace RNSkia
