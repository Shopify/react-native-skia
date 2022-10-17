#pragma once

#include "DerivedNodeProp.h"
#include "third_party/CSSColorParser.h"

namespace RNSkia {

class PositionsProp:
public DerivedProp<std::vector<SkScalar>> {
public:
  PositionsProp(PropId name): DerivedProp<std::vector<SkScalar>>() {
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

}
