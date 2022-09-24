
#pragma once

#include "JsiDomNode.h"
#include "JsiDomNodeProps.h"

namespace RNSkia {

static std::string PropNameWidth = "width";
static std::string PropNameHeight = "height";

class RectProcessor {
public:
  /**
   Processes properties representing a React Native rect from a given property. The property can be a JS wrapped
   SkRect or a JS object representing a rect.
   */
  static SkRect processRect(std::shared_ptr<JsiValue> prop) {
    if (prop->getType() == JsiValue::PropType::HostObject) {
      return *std::dynamic_pointer_cast<JsiSkRect>(prop->getAsHostObject())->getObject();
    } else {
      if (prop->hasValue(PropNameX) && prop->hasValue(PropNameY) &&
          prop->hasValue(PropNameWidth) && prop->hasValue(PropNameHeight)) {
        return SkRect::MakeXYWH(prop->getValue(PropNameX)->getAsNumber(),
                                prop->getValue(PropNameY)->getAsNumber(),
                                prop->getValue(PropNameWidth)->getAsNumber(),
                                prop->getValue(PropNameHeight)->getAsNumber());
      }
      throw std::runtime_error("Missing one or more rect properties, expected x, y, width and height.");
    }
  }
  
  /**
   Processes a properties object to see if it contains properties that can be used to create an SkRect.
   */
  static SkRect processRect(std::shared_ptr<JsiDomNodeProps> props) {
    if (props->hasValue(PropNameX) && props->hasValue(PropNameY) &&
        props->hasValue(PropNameWidth) && props->hasValue(PropNameHeight)) {
      return SkRect::MakeXYWH(props->getValue(PropNameX)->getAsNumber(),
                              props->getValue(PropNameY)->getAsNumber(),
                              props->getValue(PropNameWidth)->getAsNumber(),
                              props->getValue(PropNameHeight)->getAsNumber());
    }
    throw std::runtime_error("Missing one or more rect properties, expected x, y, width and height.");
  }
};

}
