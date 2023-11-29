#pragma once

#include "DerivedNodeProp.h"

#include "JsiSkParagraph.h"

#include <memory>
#include <string>

namespace RNSkia {

class ParagraphProp : public DerivedProp<para::Paragraph *> {
public:
  explicit ParagraphProp(PropId name,
                         const std::function<void(BaseNodeProp *)> &onChange)
      : DerivedProp<para::Paragraph *>(onChange) {
    _paragraphProp = defineProperty<NodeProp>(name);
  }

  void updateDerivedValue() override {
    if (_paragraphProp->isSet()) {
      if (_paragraphProp->value().getType() != PropType::HostObject) {
        throw std::runtime_error("Expected Paragraph object for the " +
                                 std::string(getName()) + " property.");
      }

      auto ptr = std::dynamic_pointer_cast<JsiSkParagraph>(
          _paragraphProp->value().getAsHostObject());

      if (ptr == nullptr) {
        throw std::runtime_error("Expected paragraph object for the " +
                                 std::string(getName()) + " property.");
      }

      setDerivedValue(ptr->getParagraph());
    } else {
      setDerivedValue(nullptr);
    }
  }

private:
  NodeProp *_paragraphProp;
};

} // namespace RNSkia
