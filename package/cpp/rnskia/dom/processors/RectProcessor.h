
#pragma once

#include "JsiDomNode.h"
#include "JsiDomNodeProps.h"

namespace RNSkia {

static const char* PropNameWidth = "width";
static const char* PropNameHeight = "height";

class RectProcessor {
public:
  /**
   Processes properties representing a React Native rect from a given property. The property can be a JS wrapped
   SkRect or a JS object representing a rect.
   */
  void processRect(std::shared_ptr<JsiValue> prop) {
    if (prop->getType() == JsiValue::PropType::HostObject) {
      _rectCache = *std::dynamic_pointer_cast<JsiSkRect>(prop->getAsHostObject())->getObject();
      return;
    } else {
      if (_hasPropX && _hasPropY && _hasPropWidth && _hasPropHeight) {
        _rectCache = SkRect::MakeXYWH(prop->getValue(PropNameX)->getAsNumber(),
                                      prop->getValue(PropNameY)->getAsNumber(),
                                      prop->getValue(PropNameWidth)->getAsNumber(),
                                      prop->getValue(PropNameHeight)->getAsNumber());
        return;
      }
      throw std::runtime_error("Missing one or more rect properties, expected x, y, width and height when reading property.");
    }
  }
  
  /**
   Processes a properties object to see if it contains properties that can be used to create an SkRect.
   */
  void processRect(std::shared_ptr<JsiDomNodeProps> props) {
    if (_hasPropX && _hasPropY && _hasPropWidth && _hasPropHeight) {
      _rectCache = SkRect::MakeXYWH(props->getValue(PropNameX)->getAsNumber(),
                                    props->getValue(PropNameY)->getAsNumber(),
                                    props->getValue(PropNameWidth)->getAsNumber(),
                                    props->getValue(PropNameHeight)->getAsNumber());
      return;
    }
    throw std::runtime_error("Missing one or more rect properties, expected x, y, width and height.");
  }
  
  void updateProps(std::shared_ptr<JsiValue> prop) {
    _hasPropX = false;
    _hasPropY = false;
    _hasPropWidth = false;
    _hasPropHeight = false;
    
    if (prop->getType() == JsiValue::PropType::HostObject) {
      return;
    }
    
    _hasPropX = prop->hasValue(PropNameX);
    _hasPropY = prop->hasValue(PropNameY);
    _hasPropWidth = prop->hasValue(PropNameWidth);
    _hasPropHeight = prop->hasValue(PropNameHeight);
    
  }
  
  void updateProps(std::shared_ptr<JsiDomNodeProps> props) {
    _hasPropX = props->hasValue(PropNameX);
    _hasPropY = props->hasValue(PropNameY);
    _hasPropWidth = props->hasValue(PropNameWidth);
    _hasPropHeight = props->hasValue(PropNameHeight);
  }
  
  SkRect getRect() { return _rectCache; }
  
private:
  SkRect _rectCache;
  bool _hasPropX = false;
  bool _hasPropY = false;
  bool _hasPropWidth = false;
  bool _hasPropHeight = false;
};

}
