#pragma once

#include "DerivedNodeProp.h"
#include "third_party/CSSColorParser.h"

namespace RNSkia {

class NumbersProp:
public DerivedProp<std::vector<SkScalar>> {
public:
  NumbersProp(PropId name): DerivedProp<std::vector<SkScalar>>() {
    _positionProp = addProperty(std::make_shared<NodeProp>(name));
  }
  
  void updateDerivedValue() override {
    if (_positionProp->isSet()) {
      auto positions = _positionProp->value()->getAsArray();
      std::vector<SkScalar> derivedPositions;
      derivedPositions.reserve(positions.size());
      
      for (size_t i = 0; i < positions.size(); ++i) {
        derivedPositions.push_back(positions[i]->getAsNumber());
      }
      setDerivedValue(std::move(derivedPositions));
    } else {
      setDerivedValue(nullptr);
    }
  }
  
private:
  NodeProp* _positionProp;
};


class Numbers16Prop:
public DerivedProp<std::vector<u_int16_t>> {
public:
  Numbers16Prop(PropId name): DerivedProp<std::vector<u_int16_t>>() {
    _positionProp = addProperty(std::make_shared<NodeProp>(name));
  }
  
  void updateDerivedValue() override {
    if (_positionProp->isSet()) {
      auto positions = _positionProp->value()->getAsArray();
      std::vector<u_int16_t> derivedPositions;
      derivedPositions.reserve(positions.size());
      
      for (size_t i = 0; i < positions.size(); ++i) {
        derivedPositions.push_back(static_cast<u_int16_t>(positions[i]->getAsNumber()));
      }
      setDerivedValue(std::move(derivedPositions));
    } else {
      setDerivedValue(nullptr);
    }
  }
  
private:
  NodeProp* _positionProp;
};

}
