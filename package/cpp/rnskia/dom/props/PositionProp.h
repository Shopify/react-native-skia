#pragma once

#include "DerivedNodeProp.h"
#include "third_party/CSSColorParser.h"

namespace RNSkia {


class PositionProp:
public DerivedProp<std::vector<SkScalar>> {
public:
  PositionProp(PropId name): DerivedProp<std::vector<SkScalar>>() {
    _positionProp = addProperty(std::make_shared<NodeProp>(name));
  }
  
  void updateDerivedValue() override {
    if (_positionProp->isSet()) {
      auto positions = _positionProp->value()->getAsArray();
      std::vector<SkScalar> derivedPositions;
      derivedPositions.reserve(positions.size());
      
      for (size_t i = 0; i < positions.size(); ++i) {
        
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
