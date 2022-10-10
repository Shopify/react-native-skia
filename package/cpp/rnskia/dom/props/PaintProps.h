#pragma once

#include "NodeProp.h"
#include "StrokeProps.h"
#include "BlendModeProp.h"

#include "third_party/CSSColorParser.h"
#include "JsiSkPaint.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPaint.h>

#pragma clang diagnostic pop

namespace RNSkia {

static PropId PropNameColor = JsiPropId::get("color");
static PropId PropNameStyle = JsiPropId::get("style");
static PropId PropNameStrokeWidth = JsiPropId::get("strokeWidth");
static PropId PropNameBlendMode = JsiPropId::get("blendMode");
static PropId PropNameStrokeJoin = JsiPropId::get("strokeJoin");
static PropId PropNameStrokeCap = JsiPropId::get("strokeCap");
static PropId PropNameStrokeMiter = JsiPropId::get("strokeMiter");
static PropId PropNameAntiAlias = JsiPropId::get("antiAlias");

static PropId PropNamePaint = JsiPropId::get("paint");
static PropId PropNameCurrent = JsiPropId::get("current");

class PaintProp: public BaseDerivedProp {
public:
  PaintProp(): BaseDerivedProp() {
    _paintProp = addProperty(std::make_shared<NodeProp>(PropNamePaint));
  }
  
  void beginVisit(DrawingContext *context) override {
    if (_paintProp->hasValue() && (_paintProp->isChanged() || context->isInvalid())) {
      if (_paintProp->getValue()->getType() == PropType::HostObject) {
        // Read paint property as Host Object - JsiSkPaint
        auto ptr = std::dynamic_pointer_cast<JsiSkPaint>(_paintProp->getValue()->getAsHostObject());
        if (ptr != nullptr) {
          // Update the local paint for the current context
          context->setMutablePaint(ptr->getObject());
        } else {
          throw std::runtime_error("Expected SkPaint object, got unknown object when reading paint property.");
        }
      } else if (_paintProp->getValue()->getType() == PropType::Object) {
        // We have a JS object - is it a ref?
        auto ref = _paintProp->getValue()->getValue(PropNameCurrent);
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
    _color = addProperty(std::make_shared<NodeProp>(PropNameColor));
    _style = addProperty(std::make_shared<NodeProp>(PropNameStyle));
    _strokeWidth = addProperty(std::make_shared<NodeProp>(PropNameStrokeWidth));
    _blendMode = addProperty(std::make_shared<BlendModeProp>(PropNameBlendMode));
    _strokeJoin = addProperty(std::make_shared<StrokeJoinProp>(PropNameStrokeJoin));
    _strokeCap = addProperty(std::make_shared<StrokeCapProp>(PropNameStrokeCap));
    _strokeMiter = addProperty(std::make_shared<NodeProp>(PropNameStrokeMiter));
    _antiAlias = addProperty(std::make_shared<NodeProp>(PropNameAntiAlias));
  }
  
  void beginVisit(DrawingContext* context) override {
    BaseDerivedProp::beginVisit(context);
    
    // Now we can start updating the context
    // We only get here if something has changed - start with COLOR
    if (_color->hasValue() && (_color->isChanged() || context->isInvalid())) {
      auto parsedColor = CSSColorParser::parse(_color->getValue()->getAsString());
      if (parsedColor.a == -1.0f) {
        context->getMutablePaint()->setColor(SK_ColorBLACK);
      } else {
        context->getMutablePaint()->setColor(SkColorSetARGB(parsedColor.a * 255,                                                   
                                                            parsedColor.r,
                                                            parsedColor.g,
                                                            parsedColor.b));
      }
    }
    // Style
    if (_style->hasValue() && (_style->isChanged() || context->isInvalid())) {
      auto styleValue = _style->getValue()->getAsString();
      if (styleValue == "stroke") {
        context->getMutablePaint()->setStyle(SkPaint::Style::kStroke_Style);
      } else if (styleValue == "fill") {
        context->getMutablePaint()->setStyle(SkPaint::Style::kFill_Style);
      } else {
        throw std::runtime_error(styleValue + " is not a valud value for the style property.");
      }
    }
    // Stroke Width
    if (_strokeWidth->hasValue() && (_strokeWidth->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setStrokeWidth(_strokeWidth->getValue()->getAsNumber());
    }
    // Blend mode
    if (_blendMode->hasValue() && (_blendMode->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setBlendMode(*_blendMode->getDerivedValue());
    }
    // Stroke Join
    if (_strokeJoin->hasValue() && (_strokeJoin->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setStrokeJoin(*_strokeJoin->getDerivedValue());
    }
    // Stroke Cap
    if (_strokeCap->hasValue() && (_strokeCap->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setStrokeCap(*_strokeCap->getDerivedValue());
    }
    // Stroke Miter
    if (_strokeMiter->hasValue() && (_strokeMiter->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setStrokeMiter(_strokeMiter->getValue()->getAsNumber());
    }
    // AntiAlias
    if (_antiAlias->hasValue() && (_antiAlias->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setAntiAlias(_antiAlias->getValue()->getAsNumber());
    }
  }

private:
  NodeProp* _color;
  NodeProp* _style;
  NodeProp* _strokeWidth;
  BlendModeProp* _blendMode;
  StrokeJoinProp* _strokeJoin;
  StrokeCapProp* _strokeCap;
  NodeProp* _strokeMiter;
  NodeProp* _antiAlias;
};

}

