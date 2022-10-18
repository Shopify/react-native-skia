#pragma once

#include "DerivedNodeProp.h"

#include "PaintProps.h"

namespace RNSkia {

class LayerProp: public DerivedProp<SkPaint> {
public:
  LayerProp(PropId name): DerivedProp<SkPaint>() {
    _layerPaintProp = addProperty(std::make_shared<PaintProp>(name));
    _layerBoolProp = addProperty(std::make_shared<NodeProp>(name));
  }
  
  void updateDerivedValue() override {
    if (_layerBoolProp->isSet() && _layerBoolProp->value()->getType() == PropType::Bool) {
      _isBool = true;
      setDerivedValue(nullptr);
      return;
    }
    
    if (_layerPaintProp->isSet()) {
      // We have a paint object for the layer property
      setDerivedValue(_layerPaintProp->getDerivedValue());
      _isBool = false;
    } else {
      _isBool = false;
      setDerivedValue(nullptr);
    }
  }
  
  bool isBool() { return _isBool; }
    
private:
  PaintProp* _layerPaintProp;
  NodeProp* _layerBoolProp;
  std::atomic<bool> _isBool;
};

}
