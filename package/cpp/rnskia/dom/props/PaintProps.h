#pragma once

#include "BlendModeProp.h"
#include "ColorProp.h"
#include "NodeProp.h"
#include "StrokeProps.h"

#include "JsiSkPaint.h"
#include "third_party/CSSColorParser.h"

#include <memory>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPaint.h>

#pragma clang diagnostic pop

namespace RNSkia {

class PaintProp : public DerivedProp<SkPaint> {
public:
  PaintProp(PropId name, PropertyDidUpdateCallback &propertyDidUpdate)
      : DerivedProp<SkPaint>(propertyDidUpdate) {
    _paintProp = addProperty<NodeProp>(name);
  }

  explicit PaintProp(PropertyDidUpdateCallback &propertyDidUpdate)
      : PaintProp("paint", propertyDidUpdate) {}

  void updateDerivedValue() override {
    if (_paintProp->isSet()) {
      if (_paintProp->value().getType() == PropType::HostObject) {
        // Read paint property as Host Object - JsiSkPaint
        auto ptr = _paintProp->value().getAs<JsiSkPaint>();
        if (ptr != nullptr) {
          setDerivedValue(ptr->getObject());
        } else {
          throw std::runtime_error("Expected SkPaint object, got unknown "
                                   "object when reading paint property.");
        }
      } else {
        setDerivedValue(nullptr);
      }
    } else {
      setDerivedValue(nullptr);
    }
  }

private:
  NodeProp *_paintProp;
};

class PaintProps : public BaseDerivedProp {
public:
  explicit PaintProps(PropertyDidUpdateCallback &propertyDidUpdate)
      : BaseDerivedProp(propertyDidUpdate) {
    _color = addProperty<ColorProp>("color");
    _style = addProperty<NodeProp>("style");
    _strokeWidth = addProperty<NodeProp>("strokeWidth");
    _blendMode = addProperty<BlendModeProp>("blendMode");
    _strokeJoin = addProperty<StrokeJoinProp>("strokeJoin");
    _strokeCap = addProperty<StrokeCapProp>("strokeCap");
    _strokeMiter = addProperty<NodeProp>("strokeMiter");
    _antiAlias = addProperty<NodeProp>("antiAlias");
    _opacity = addProperty<NodeProp>("opacity");
  }

  void decorate(DrawingContext *context) {
    // Now we can start updating the context

    // Opacity
    if (_opacity->isChanged() || context->isChanged()) {
      auto parent = context->getParent();
      auto paint = context->getMutablePaint();
      if (_opacity->isSet()) {
        auto currentOpacity = _opacity->value().getAsNumber();
        auto parent = context->getParent();
        if (parent != nullptr) {
          currentOpacity *= parent->getPaint()->getAlphaf();
        }
        paint->setAlphaf(currentOpacity);
      } else {
        if (parent != nullptr) {
          paint->setAlphaf(parent->getPaint()->getAlphaf());
        } else {
          paint->setAlphaf(1.0);
        }
      }
    }

    // COLOR
    if (_color->isSet() && (_color->isChanged() || context->isChanged())) {
      auto paint = context->getMutablePaint();
      auto opacity = paint->getAlphaf();
      paint->setShader(nullptr);
      paint->setColor(*_color->getDerivedValue());
      paint->setAlphaf(opacity * paint->getColor4f().fA);
    }

    // Style
    if (_style->isSet() && (_style->isChanged() || context->isChanged())) {
      auto styleValue = _style->value().getAsString();
      if (styleValue == "stroke") {
        context->getMutablePaint()->setStyle(SkPaint::Style::kStroke_Style);
      } else if (styleValue == "fill") {
        context->getMutablePaint()->setStyle(SkPaint::Style::kFill_Style);
      } else {
        throw std::runtime_error(
            styleValue + " is not a valud value for the style property.");
      }
    }
    // Stroke Width
    if (_strokeWidth->isSet() &&
        (_strokeWidth->isChanged() || context->isChanged())) {
      context->getMutablePaint()->setStrokeWidth(
          _strokeWidth->value().getAsNumber());
    }
    // Blend mode
    if (_blendMode->isSet() &&
        (_blendMode->isChanged() || context->isChanged())) {
      context->getMutablePaint()->setBlendMode(*_blendMode->getDerivedValue());
    }
    // Stroke Join
    if (_strokeJoin->isSet() &&
        (_strokeJoin->isChanged() || context->isChanged())) {
      context->getMutablePaint()->setStrokeJoin(
          *_strokeJoin->getDerivedValue());
    }
    // Stroke Cap
    if (_strokeCap->isSet() &&
        (_strokeCap->isChanged() || context->isChanged())) {
      context->getMutablePaint()->setStrokeCap(*_strokeCap->getDerivedValue());
    }
    // Stroke Miter
    if (_strokeMiter->isSet() &&
        (_strokeMiter->isChanged() || context->isChanged())) {
      context->getMutablePaint()->setStrokeMiter(
          _strokeMiter->value().getAsNumber());
    }
    // AntiAlias
    if (_antiAlias->isSet() &&
        (_antiAlias->isChanged() || context->isChanged())) {
      context->getMutablePaint()->setAntiAlias(_antiAlias->value().getAsBool());
    }
  }

  void updateDerivedValue() override {}

private:
  ColorProp *_color;
  NodeProp *_style;
  NodeProp *_strokeWidth;
  BlendModeProp *_blendMode;
  StrokeJoinProp *_strokeJoin;
  StrokeCapProp *_strokeCap;
  NodeProp *_strokeMiter;
  NodeProp *_antiAlias;
  NodeProp *_opacity;
};

} // namespace RNSkia
