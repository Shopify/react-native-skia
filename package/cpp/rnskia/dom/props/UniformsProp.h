#pragma once

#include "DerivedNodeProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkRuntimeEffect.h>

#pragma clang diagnostic pop

namespace RNSkia {

class UniformsProp:
public BaseDerivedProp {
public:
  UniformsProp(PropId name): BaseDerivedProp() {
    _uniformsProp = addProperty(std::make_shared<NodeProp>(name));
  }
  
  void processUniforms(SkRuntimeShaderBuilder& rtb, sk_sp<SkRuntimeEffect> source) {
    if (!_uniformsProp->isSet()) {
      return;
    }
    auto propObject = _uniformsProp->value();
    auto keys = propObject->getKeys();
    
    auto uniformsCount = source->uniforms().size();
    
    for (size_t i = 0; i < uniformsCount; ++i) {
      
      auto it = source->uniforms().begin() + i;
      auto name = JsiPropId::get(it->name.c_str());
      
      if (!propObject->hasValue(name)) {
        throw std::runtime_error("The runtime effect has the uniform value \"" + std::string(name) +
                                 "\" declared, but it is missing from the uniforms property of the Runtime effect.");
      }
      
      auto value = propObject->getValue(name);
      
      // A uniform value can be a single number, a vector or an array of numbers
      // Or an array of the above
      if (value->getType() == PropType::Number) {
        // Set numeric uniform - this might be possible to optimize?
        rtb.uniform(name) = static_cast<SkScalar>(value->getAsNumber());
        
      } else if (value->getType() == PropType::Array) {
        // Array
        auto arrayValue = value->getAsArray();
        
        std::vector<SkScalar> set;
        set.reserve(arrayValue.size());
        for (size_t n = 0; n < arrayValue.size(); ++n) {
          set.push_back(arrayValue[n]->getAsNumber());
        }
        rtb.uniform(name).set(set.data(), static_cast<int>(set.size()));
        
      } else if (value->getType() == PropType::HostObject ||
                 value->getType() == PropType::Object) {
        // Vector (JsiSkPoint / JsiSkRect)
        auto pointValue = PointProp::processValue(value);
        std::vector<SkScalar> set;
        set.reserve(2);
        set.push_back(pointValue.x());
        set.push_back(pointValue.y());
        rtb.uniform(name).set(set.data(), static_cast<int>(set.size()));
      }
    }
  }
  
private:
  
  /*void processArray(std::shared_ptr<JsiValue> propValue) {
    for (size_t i = 0; i < propValue.size(); ++i) {
      auto name = keys[i];
      auto value = propValue->getValue(name);
      // A uniform value can be a single number, a vector or an array of numbers
      // Or an array of the above
      if (value->getType() == PropType::Number) {
        // Number
        auto numericValue = value->getAsNumber();
        // TODO: Process number
      } else if (value->getType() == PropType::Array) {
        // Array
        processArray(array);
      } else if (value->getType() == PropType::HostObject ||
                 value->getType() == PropType::Object) {
        // Vector (JsiSkPoint / JsiSkRect)
        auto pointValue = PointProp::processValue(value);
      }
    }
  }*/
  
  void processValue(std::shared_ptr<JsiValue> value) {
    if (value->getType() == PropType::Array) {
      
    }
    
  }
  
  NodeProp* _uniformsProp;
};

}
