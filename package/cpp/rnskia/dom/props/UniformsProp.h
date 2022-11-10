#pragma once

#include "DerivedNodeProp.h"
#include "JsiSkRuntimeEffect.h"

#include <memory>
#include <string>
#include <vector>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkRuntimeEffect.h>

#pragma clang diagnostic pop

namespace RNSkia {

class UniformsProp : public DerivedSkProp<SkData> {
public:
  UniformsProp(PropId name, NodeProp *sourceProp) : DerivedSkProp<SkData>() {
    _uniformsProp = addProperty(std::make_shared<NodeProp>(name));
    _sourceProp = sourceProp;
  }

  void updateDerivedValue() override {
    if (!_uniformsProp->isSet()) {
      return;
    }

    // Get the effect
    auto source = _sourceProp->value().getAs<JsiSkRuntimeEffect>()->getObject();

    // Flatten uniforms from property
    auto uniformValues = flattenUniforms(source.get(), _uniformsProp->value());

    // Cast uniforms according to the declaration in the shader
    auto uniformsData = castUniforms(source.get(), uniformValues);

    // Save derived value
    setDerivedValue(uniformsData);
  }

private:
  sk_sp<SkData> castUniforms(SkRuntimeEffect *source,
                             const std::vector<SkScalar> &values) {
    // Create memory for uniforms
    auto uniformsData = SkData::MakeUninitialized(source->uniformSize());

    // Loop through all uniforms in the effect and load data from the flattened
    // array of values
    const auto &u = source->uniforms();
    for (std::size_t i = 0; i < u.size(); i++) {
      auto it = source->uniforms().begin() + i;
      RuntimeEffectUniform reu = JsiSkRuntimeEffect::fromUniform(*it);
      for (std::size_t j = 0; j < reu.columns * reu.rows; ++j) {
        const std::size_t offset = reu.slot + j;
        float fValue = values.at(offset);
        int iValue = static_cast<int>(fValue);
        auto value = reu.isInteger ? iValue : fValue;
        memcpy(SkTAddOffset<void>(uniformsData->writable_data(),
                                  offset * sizeof(value)),
               &value, sizeof(value));
      }
    }

    return uniformsData;
  }

  std::vector<SkScalar> flattenUniforms(SkRuntimeEffect *source,
                                        const JsiValue &propObject) {
    auto uniformsCount = source->uniforms().size();
    std::vector<SkScalar> uniformValues;

    for (size_t i = 0; i < uniformsCount; ++i) {
      auto it = source->uniforms().begin() + i;
      auto name = JsiPropId::get(it->name.c_str());

      if (!propObject.hasValue(name)) {
        throw std::runtime_error("The runtime effect has the uniform value \"" +
                                 std::string(name) +
                                 "\" declared, but it is missing from the "
                                 "uniforms property of the Runtime effect.");
      }

      auto value = propObject.getValue(name);

      // A uniform value can be a single number, a vector or an array of numbers
      // Or an array of the above
      if (value.getType() == PropType::Number) {
        // Set numeric uniform
        uniformValues.push_back(value.getAsNumber());
      } else if (value.getType() == PropType::Array) {
        // Array
        auto arrayValue = value.getAsArray();
        for (size_t n = 0; n < arrayValue.size(); ++n) {
          auto a = arrayValue[n];
          if (a.getType() == PropType::Number) {
            uniformValues.push_back(a.getAsNumber());
          } else {
            for (size_t j = 0; j < a.getAsArray().size(); ++j) {
              uniformValues.push_back(a.getAsArray()[j].getAsNumber());
            }
          }
        }
      } else if (value.getType() == PropType::HostObject ||
                 value.getType() == PropType::Object) {
        // Vector (JsiSkPoint / JsiSkRect)
        auto pointValue = PointProp::processValue(value);
        uniformValues.push_back(pointValue.x());
        uniformValues.push_back(pointValue.y());
      }
    }
    return uniformValues;
  }

  NodeProp *_uniformsProp;
  NodeProp *_sourceProp;
};

class SimpleUniformsProp : public BaseDerivedProp {
public:
  SimpleUniformsProp(PropId name, NodeProp *sourceProp) : BaseDerivedProp() {
    _uniformsProp = addProperty(std::make_shared<NodeProp>(name));
    _sourceProp = sourceProp;
  }

  void processUniforms(SkRuntimeShaderBuilder &rtb) {
    if (!_uniformsProp->isSet()) {
      return;
    }

    auto propObject = _uniformsProp->value();
    auto source = _sourceProp->value().getAs<JsiSkRuntimeEffect>()->getObject();

    auto uniformsCount = source->uniforms().size();

    for (size_t i = 0; i < uniformsCount; ++i) {
      auto it = source->uniforms().begin() + i;
      auto name = JsiPropId::get(it->name.c_str());

      if (!propObject.hasValue(name)) {
        throw std::runtime_error("The runtime effect has the uniform value \"" +
                                 std::string(name) +
                                 "\" declared, but it is missing from the "
                                 "uniforms property of the Runtime effect.");
      }

      auto value = propObject.getValue(name);

      // A uniform value can be a single number, a vector or an array of numbers
      // Or an array of the above
      if (value.getType() == PropType::Number) {
        // Set numeric uniform
        rtb.uniform(name) = value.getAsNumber();
      } else if (value.getType() == PropType::Array) {
        // Array
        auto arrayValue = value.getAsArray();
        std::vector<SkScalar> set;
        for (size_t n = 0; n < arrayValue.size(); ++n) {
          auto a = arrayValue[n];
          if (a.getType() == PropType::Number) {
            set.push_back(a.getAsNumber());
          } else {
            for (size_t j = 0; j < a.getAsArray().size(); ++j) {
              set.push_back(a.getAsArray()[j].getAsNumber());
            }
          }
        }
        rtb.uniform(name).set(set.data(), static_cast<int>(set.size()));

      } else if (value.getType() == PropType::HostObject ||
                 value.getType() == PropType::Object) {
        // Vector (JsiSkPoint / JsiSkRect)
        auto pointValue = PointProp::processValue(value);
        std::vector<SkScalar> set = {pointValue.x(), pointValue.y()};

        rtb.uniform(name).set(set.data(), static_cast<int>(set.size()));
      } else {
        throw std::runtime_error("Unexpected type for uniform prop \"" +
                                 std::string(name) + "\". Got " +
                                 value.getTypeAsString(value.getType()));
      }
    }
  }

  void updateDerivedValue() override {}

private:
  NodeProp *_uniformsProp;
  NodeProp *_sourceProp;
};

} // namespace RNSkia
