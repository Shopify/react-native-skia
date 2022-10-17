#pragma once

#include "DerivedNodeProp.h"

#include "VertexModeProp.h"
#include "ColorProp.h"
#include "NumbersProp.h"
#include "PointsProp.h"


#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkVertices.h>

#pragma clang diagnostic pop

namespace RNSkia {

class VerticesProps:
public DerivedSkProp<SkVertices> {
public:
  VerticesProps(): DerivedSkProp<SkVertices>() {
    _vertexModeProp = addProperty(std::make_shared<VertexModeProp>(JsiPropId::get("mode")));
    _colorsProp = addProperty(std::make_shared<ColorsProp>(JsiPropId::get("colors")));
    _verticesProp = addProperty(std::make_shared<PointsProp>(JsiPropId::get("vertices")));
    _texturesProp = addProperty(std::make_shared<PointsProp>(JsiPropId::get("textures")));
    _indiciesProp = addProperty(std::make_shared<Numbers16Prop>(JsiPropId::get("indicies")));
    
    _vertexModeProp->require();
    _verticesProp->require();
  }
  
  bool hasColors() {
    return _colorsProp->isSet();
  }
  
  void updateDerivedValue() override {
    SkVertices::VertexMode *vertextMode = _vertexModeProp->getDerivedValue().get();
    std::vector<SkColor> *colors = _colorsProp->getDerivedValue().get();
    auto vertices = _verticesProp->getDerivedValue();
    auto textures = _texturesProp->getDerivedValue();
    auto indicies = _indiciesProp->getDerivedValue();
    
    setDerivedValue(SkVertices::MakeCopy(*vertextMode,
                                         static_cast<int>(vertices->size()),
                                         _verticesProp->isSet() ? vertices->data() : nullptr,
                                         _texturesProp->isSet() ? textures->data() : nullptr,
                                         _colorsProp->isSet() ? colors->data() : nullptr,
                                         _indiciesProp->isSet() ? static_cast<int>(indicies->size()) : 0,
                                         _indiciesProp->isSet() ? indicies->data() : nullptr));
            
  }
  
private:
  VertexModeProp* _vertexModeProp;
  ColorsProp* _colorsProp;
  PointsProp* _verticesProp;
  PointsProp* _texturesProp;
  Numbers16Prop* _indiciesProp;
};

}
