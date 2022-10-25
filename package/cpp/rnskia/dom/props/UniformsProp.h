#pragma once

#include "DerivedNodeProp.h"
#include "JsiSkRuntimeEffect.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkRuntimeEffect.h>

#pragma clang diagnostic pop

namespace RNSkia {

class UniformsProp:
public DerivedSkProp<SkData> {
public:
  UniformsProp(PropId name, NodeProp* sourceProp): DerivedSkProp<SkData>() {
    _uniformsProp = addProperty(std::make_shared<NodeProp>(name));
    _sourceProp = sourceProp;
  }
  
  void updateDerivedValue() override {
    if (!_uniformsProp->isSet()) {
      return;
    }
    
    auto propObject = _uniformsProp->value();
    auto source = _sourceProp->value()->getAs<JsiSkRuntimeEffect>()->getObject();
    
    auto uniformsCount = source->uniforms().size();
    
    // Create SkData for uniforms
    auto uniformsData = SkData::MakeUninitialized(source->uniformSize());
    
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
        // Set numeric uniform - TODO: Do we need to handle sizes in any way here...?
        SkScalar v = value->getAsNumber();
        memcpy(SkTAddOffset<void>(uniformsData->writable_data(), it->offset), &v, it->sizeInBytes());
      } else if (value->getType() == PropType::Array) {
        // Array
        auto arrayValue = value->getAsArray();
        std::vector<SkScalar> set;
        set.reserve(arrayValue.size());
        for (size_t n = 0; n < arrayValue.size(); ++n) {
          set.push_back(arrayValue[n]->getAsNumber());
        }
        memcpy(SkTAddOffset<void>(uniformsData->writable_data(), it->offset), set.data(),
               static_cast<int>(set.size()) * it->sizeInBytes());
        
      } else if (value->getType() == PropType::HostObject ||
                 value->getType() == PropType::Object) {
        // Vector (JsiSkPoint / JsiSkRect)
        auto pointValue = PointProp::processValue(value);
        std::vector<SkScalar> set = { pointValue.x(), pointValue.y() };
        
        memcpy(SkTAddOffset<void>(uniformsData->writable_data(), it->offset), set.data(),
               static_cast<int>(set.size()) * it->sizeInBytes());
      }
    }
    setDerivedValue(uniformsData);
  }
  
private:
  void setValue(SkScalar val, const RuntimeEffectUniform& reu, sk_sp<SkData> uniforms) {
    for (std::size_t j = 0; j < reu.columns * reu.rows; ++j) {
      const std::size_t offset = reu.slot + j;
      float fValue = val;
      int iValue = static_cast<int>(fValue);
      auto value = reu.isInteger ? iValue : fValue;
      memcpy(SkTAddOffset<void>(uniforms->writable_data(),
                                offset * sizeof(value)),
             &value, sizeof(value));
    }
  }
  
  NodeProp* _uniformsProp;
  NodeProp* _sourceProp;
};

class SimpleUniformsProp:
public BaseDerivedProp {
public:
  SimpleUniformsProp(PropId name, NodeProp* sourceProp): BaseDerivedProp() {
    _uniformsProp = addProperty(std::make_shared<NodeProp>(name));
    _sourceProp = sourceProp;
  }
  
  void processUniforms(SkRuntimeShaderBuilder& rtb) {
    if (!_uniformsProp->isSet()) {
      return;
    }
    
    auto propObject = _uniformsProp->value();
    auto source = _sourceProp->value()->getAs<JsiSkRuntimeEffect>()->getObject();
    
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
        // Set numeric uniform - TODO: Do we need to handle sizes in any way here...?
        rtb.uniform(name) = value->getAsNumber();
      } else if (value->getType() == PropType::Array) {
        // Array
        auto arrayValue = value->getAsArray();
        std::vector<SkScalar> set;
        set.reserve(arrayValue.size());
        for (size_t n = 0; n < arrayValue.size(); ++n) {
          set.push_back(arrayValue[n]->getAsNumber());
        }
        rtb.uniform(name) = set.data();
        
      } else if (value->getType() == PropType::HostObject ||
                 value->getType() == PropType::Object) {
        // Vector (JsiSkPoint / JsiSkRect)
        auto pointValue = PointProp::processValue(value);
        std::vector<SkScalar> set = { pointValue.x(), pointValue.y() };
        
        rtb.uniform(name) = set.data();
      } else {
        throw std::runtime_error("Unexpected type for uniform prop \"" +
                                 std::string(name) + "\". Got " + value->getTypeAsString(value->getType()));
      }
    }
  }
  
  void updateDerivedValue() override {}
  
private:
  void setValue(SkScalar val, const RuntimeEffectUniform& reu, sk_sp<SkData> uniforms) {
    for (std::size_t j = 0; j < reu.columns * reu.rows; ++j) {
      const std::size_t offset = reu.slot + j;
      float fValue = val;
      int iValue = static_cast<int>(fValue);
      auto value = reu.isInteger ? iValue : fValue;
      memcpy(SkTAddOffset<void>(uniforms->writable_data(),
                                offset * sizeof(value)),
             &value, sizeof(value));
    }
  }
  
  NodeProp* _uniformsProp;
  NodeProp* _sourceProp;
};


}
