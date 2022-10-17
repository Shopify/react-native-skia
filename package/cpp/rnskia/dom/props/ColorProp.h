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

class ColorsProp:
public DerivedProp<std::vector<SkColor>> {
public:
  ColorsProp(PropId name): DerivedProp<std::vector<SkColor>>() {
    _colorsProp = addProperty(std::make_shared<NodeProp>(name));
  }
  
  void updateDerivedValue() override {
    if (_colorsProp->isSet()) {
      auto colors = _colorsProp->value()->getAsArray();
      std::vector<SkColor> derivedColors;
      derivedColors.reserve(colors.size());
      
      for (size_t i = 0; i < colors.size(); ++i) {
        auto colorValue = colors[i]->getAsString();
        auto parsedColor = CSSColorParser::parse(colorValue);
        if (parsedColor.a == -1.0f) {
          derivedColors.push_back(SK_ColorBLACK);
        } else {
          derivedColors.push_back(SkColorSetARGB(parsedColor.a * 255,
                                                 parsedColor.r,
                                                 parsedColor.g,
                                                 parsedColor.b));
        }
      }
      setDerivedValue(std::move(derivedColors));
    } else {
      setDerivedValue(nullptr);
    }
  }
  
private:
  NodeProp* _colorsProp;
};

}
