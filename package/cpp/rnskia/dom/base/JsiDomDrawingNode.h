

#pragma once

#include "JsiDomRenderNode.h"
#include "third_party/CSSColorParser.h"

namespace RNSkia {

class JsiDomDrawingNode: public JsiDomRenderNode {
public:
  JsiDomDrawingNode(std::shared_ptr<RNSkPlatformContext> context,
                    jsi::Runtime& runtime,
                    const jsi::Value *arguments,
                    size_t count):
  JsiDomRenderNode(context, runtime, arguments, count) {}
  
protected:
  virtual void draw(std::shared_ptr<JsiBaseDrawingContext> context) = 0;
  
  void renderNode(std::shared_ptr<JsiBaseDrawingContext> context) override {
    if(_isDirty) {
      _isDirty = false;
      _childContext = processContext(context, getProperties());
    }
    
    draw(std::make_shared<JsiDrawingContext>(context->getCanvas(), _childContext->getPaint(), _childContext->getOpacity()));    
  }
  
  void onPropsRead(jsi::Runtime& runtime) override {
    JsiDomRenderNode::onPropsRead(runtime);
    
    getProperties()->tryReadStringProperty(runtime, "color", true);
    getProperties()->tryReadStringProperty(runtime, "style", true);
    getProperties()->tryReadNumericProperty(runtime, "strokeWidth", true);
    
    _isDirty = true;
  }
private:
  std::shared_ptr<JsiBaseDrawingContext> processContext(std::shared_ptr<JsiBaseDrawingContext> context,
                                                        std::shared_ptr<JsiDomNodeProps> props) {
    if(props->hasValue("color") || props->hasValue("style") || props->hasValue("strokeWidth")) {
      // Copy paint from parent
      auto paint = std::make_shared<SkPaint>(*context->getPaint());
      double opacity = 1.0f;
      
      if (props->hasValue("color")) {
        auto colorValue = props->getValue("color")->getAsString();
        auto parsedColor = CSSColorParser::parse(colorValue);
        if(parsedColor.a == -1.0f) {
          paint->setColor(SK_ColorBLACK);
        } else {
          paint->setColor(SkColorSetARGB(parsedColor.a * 255, parsedColor.r, parsedColor.g, parsedColor.b));
        }
      }
      if (props->hasValue("style")) {
        auto styleValue = props->getValue("style")->getAsString();
        if (styleValue == "stroke") {
          paint->setStyle(SkPaint::Style::kStroke_Style);
        } else if (styleValue == "fill") {
          paint->setStyle(SkPaint::Style::kFill_Style);
        }
        
        if(props->hasValue("strokeWidth")) {
          paint->setStrokeWidth(props->getValue("strokeWidth")->getAsNumber());
        }
        
        if(props->hasValue("opacity")) {
          opacity = opacity * props->getValue("opacity")->getAsNumber();
        }
      }
      
      return std::make_shared<JsiDrawingContext>(context->getCanvas(), paint, opacity);
    }
    return context;
  }
  
  std::shared_ptr<JsiBaseDrawingContext> _childContext;
  bool _isDirty = true;
};

}
