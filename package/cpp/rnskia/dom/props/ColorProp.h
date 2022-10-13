#pragma once

#include "DerivedNodeProp.h"
#include "third_party/CSSColorParser.h"

namespace RNSkia {

class ColorProp:
public DerivedProp<SkColor> {
public:
  ColorProp(PropId name): DerivedProp<SkColor>() {
    _colorProp = addProperty(std::make_shared<NodeProp>(name));
  }
  
  void updateDerivedValue() override {
    if (_colorProp->isSet()) {
      auto parsedColor = CSSColorParser::parse(_colorProp->value()->getAsString());
      if (parsedColor.a == -1.0f) {
        setDerivedValue(std::make_shared<SkColor>(SK_ColorBLACK));
      } else {
        setDerivedValue(SkColorSetARGB(parsedColor.a * 255,                       
                                       parsedColor.r,
                                       parsedColor.g,
                                       parsedColor.b));
      }
    } else {
      setDerivedValue(nullptr);
    }
  }
  
private:
  NodeProp* _colorProp;
};

}
