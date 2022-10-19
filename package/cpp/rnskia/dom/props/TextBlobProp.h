#pragma once

#include "DerivedNodeProp.h"

#include "JsiSkTextBlob.h"

namespace RNSkia {

class TextBlobProp:
public DerivedSkProp<SkTextBlob> {
public:
  TextBlobProp(PropId name): DerivedSkProp<SkTextBlob>() {
    _textBlobProp = addProperty(std::make_shared<NodeProp>(name));
  }
  
  void updateDerivedValue() override {
    if (_textBlobProp->value()->getType() != PropType::HostObject) {
      throw std::runtime_error("Expected SkTextBlob object for the " +
                               std::string(getName()) + " property.");
    }
    
    auto ptr = _textBlobProp->value()->getAs<JsiSkTextBlob>();
    if (ptr == nullptr) {
      throw std::runtime_error("Expected SkTextBlob object for the " +
                               std::string(getName()) + " property.");
    }
    
    setDerivedValue(ptr->getObject());
  }
  
private:
  NodeProp* _textBlobProp;
};

}
