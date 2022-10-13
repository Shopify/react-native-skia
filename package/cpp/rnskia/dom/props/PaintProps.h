#pragma once

#include "NodeProp.h"
#include "StrokeProps.h"
#include "BlendModeProp.h"
#include "ColorProp.h"

#include "third_party/CSSColorParser.h"
#include "JsiSkPaint.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPaint.h>

#pragma clang diagnostic pop

namespace RNSkia {

class PaintProp: public BaseDerivedProp {
public:
  PaintProp(): BaseDerivedProp() {
    _paintProp = addProperty(std::make_shared<NodeProp>(JsiPropId::get("paint")));
  }
  
  void beginVisit(DrawingContext *context) override {
    if (_paintProp->isSet() && (_paintProp->isChanged() || context->isInvalid())) {
      if (_paintProp->value()->getType() == PropType::HostObject) {
        // Read paint property as Host Object - JsiSkPaint
        auto ptr = std::dynamic_pointer_cast<JsiSkPaint>(_paintProp->value()->getAsHostObject());
        if (ptr != nullptr) {
          // Update the local paint for the current context
          context->setMutablePaint(ptr->getObject());
        } else {
          throw std::runtime_error("Expected SkPaint object, got unknown object when reading paint property.");
        }
      } else if (_paintProp->value()->getType() == PropType::Object) {
        // We have a JS object - is it a ref?
        auto ref = _paintProp->value()->getValue(JsiPropId::get("current"));
        if (ref->getType() == PropType::HostObject) {
          auto ptr = std::dynamic_pointer_cast<JsiSkPaint>(ref->getAsHostObject());
          if (ptr != nullptr) {
            // Update the local paint for the current context
            context->setMutablePaint(ptr->getObject());
          } else {
            throw std::runtime_error("Expected reference to a SkPaint object, got unknown object when reading paint property.");
          }
        } else {
          throw std::runtime_error("Expected reference to a paint object, got unknown object when reading paint property.");
        }
      } else {
        throw std::runtime_error("Expected paint object, got unknown object when reading paint property.");
      }
    }
  }
  
private:
  NodeProp* _paintProp;
};

class PaintProps:
public BaseDerivedProp {
public:
  PaintProps(): BaseDerivedProp() {
    _color = addProperty(std::make_shared<ColorProp>(JsiPropId::get("color")));
    _style = addProperty(std::make_shared<NodeProp>(JsiPropId::get("style")));
    _strokeWidth = addProperty(std::make_shared<NodeProp>(JsiPropId::get("strokeWidth")));
    _blendMode = addProperty(std::make_shared<BlendModeProp>(JsiPropId::get("blendMode")));
    _strokeJoin = addProperty(std::make_shared<StrokeJoinProp>(JsiPropId::get("strokeJoin")));
    _strokeCap = addProperty(std::make_shared<StrokeCapProp>(JsiPropId::get("strokeCap")));
    _strokeMiter = addProperty(std::make_shared<NodeProp>(JsiPropId::get("strokeMiter")));
    _antiAlias = addProperty(std::make_shared<NodeProp>(JsiPropId::get("antiAlias")));
  }
  
  void beginVisit(DrawingContext* context) override {
    BaseDerivedProp::beginVisit(context);
    
    // Now we can start updating the context
    // We only get here if something has changed - start with COLOR
    if (_color->isSet() && (_color->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setColor(*_color->getDerivedValue());
    }
    // Style
    if (_style->isSet() && (_style->isChanged() || context->isInvalid())) {
      auto styleValue = _style->value()->getAsString();
      if (styleValue == "stroke") {
        context->getMutablePaint()->setStyle(SkPaint::Style::kStroke_Style);
      } else if (styleValue == "fill") {
        context->getMutablePaint()->setStyle(SkPaint::Style::kFill_Style);
      } else {
        throw std::runtime_error(styleValue + " is not a valud value for the style property.");
      }
    }
    // Stroke Width
    if (_strokeWidth->isSet() && (_strokeWidth->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setStrokeWidth(_strokeWidth->value()->getAsNumber());
    }
    // Blend mode
    if (_blendMode->isSet() && (_blendMode->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setBlendMode(*_blendMode->getDerivedValue());
    }
    // Stroke Join
    if (_strokeJoin->isSet() && (_strokeJoin->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setStrokeJoin(*_strokeJoin->getDerivedValue());
    }
    // Stroke Cap
    if (_strokeCap->isSet() && (_strokeCap->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setStrokeCap(*_strokeCap->getDerivedValue());
    }
    // Stroke Miter
    if (_strokeMiter->isSet() && (_strokeMiter->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setStrokeMiter(_strokeMiter->value()->getAsNumber());
    }
    // AntiAlias
    if (_antiAlias->isSet() && (_antiAlias->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setAntiAlias(_antiAlias->value()->getAsNumber());
    }
  }

private:
  ColorProp* _color;
  NodeProp* _style;
  NodeProp* _strokeWidth;
  BlendModeProp* _blendMode;
  StrokeJoinProp* _strokeJoin;
  StrokeCapProp* _strokeCap;
  NodeProp* _strokeMiter;
  NodeProp* _antiAlias;
};

}

