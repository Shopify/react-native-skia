
#pragma once

#include "JsiDomNode.h"
#include "JsiDomNodeProps.h"

namespace RNSkia {

static PropId PropNameWidth = JsiPropId::get("width");
static PropId PropNameHeight = JsiPropId::get("height");

class RectProcessor {
public:
  RectProcessor(const char* propName): _propName(propName) {};
  
  /**
   Processes properties representing a React Native rect from a given property. The property can be a JS wrapped
   SkRect or a JS object representing a rect.
   */
  void processRect(std::shared_ptr<JsiDomNodeProps> props) {
    if(_hasProp) {
      auto prop = props->getValue(_propName);
      // Check if the property object is a host object wrapping an SkRect
      if (prop->getType() == PropType::HostObject) {
        _rectCache = *std::dynamic_pointer_cast<JsiSkRect>(prop->getAsHostObject())->getObject();
      } else {
        // Check for propeties
        if (_hasPropX && _hasPropY && _hasPropWidth && _hasPropHeight) {
          _rectCache = SkRect::MakeXYWH(prop->getValue(PropNameX)->getAsNumber(),
                                        prop->getValue(PropNameY)->getAsNumber(),
                                        prop->getValue(PropNameWidth)->getAsNumber(),
                                        prop->getValue(PropNameHeight)->getAsNumber());
        } else {
          throw std::runtime_error("Missing one or more rect properties, expected x, y, width and height when reading rect property.");
        }
      }
    } else {
      if (_hasPropX && _hasPropY && _hasPropWidth && _hasPropHeight) {
        _rectCache = SkRect::MakeXYWH(props->getValue(PropNameX)->getAsNumber(),
                                      props->getValue(PropNameY)->getAsNumber(),
                                      props->getValue(PropNameWidth)->getAsNumber(),
                                      props->getValue(PropNameHeight)->getAsNumber());
      } else {
        throw std::runtime_error("Missing one or more rect properties, expected x, y, width and height when reading rect property.");
      }
    }
  }  
  
  void onPropsSet(std::shared_ptr<JsiDomNodeProps> props) {
    _hasProp = props->hasValue(_propName);
    if(_hasProp) {
      auto prop = props->getValue(_propName);
      
      if (prop->getType() == PropType::HostObject) {
        _hasPropX = false;
        _hasPropY = false;
        _hasPropWidth = false;
        _hasPropHeight = false;
      } else {
        _hasPropX = prop->hasValue(PropNameX);
        _hasPropY = prop->hasValue(PropNameY);
        _hasPropWidth = prop->hasValue(PropNameWidth);
        _hasPropHeight = prop->hasValue(PropNameHeight);
      }
    } else {
      _hasPropX = props->hasValue(PropNameX);
      _hasPropY = props->hasValue(PropNameY);
      _hasPropWidth = props->hasValue(PropNameWidth);
      _hasPropHeight = props->hasValue(PropNameHeight);
    }
  }
  
  SkRect getRect() { return _rectCache; }
  
private:
  SkRect _rectCache;
  const char* _propName;
  bool _hasProp = false;
  bool _hasPropX = false;
  bool _hasPropY = false;
  bool _hasPropWidth = false;
  bool _hasPropHeight = false;
};

}
