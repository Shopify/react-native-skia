#pragma once

#include "JsiProp.h"
#include "JsiSkMatrix.h"

namespace RNSkia {

static PropId PropNameTransform = JsiPropId::get("transform");

static PropId PropNameTranslateX = JsiPropId::get("translateX");
static PropId PropNameTranslateY = JsiPropId::get("translateY");
static PropId PropNameScale = JsiPropId::get("scale");
static PropId PropNameScaleX = JsiPropId::get("scaleX");
static PropId PropNameScaleY = JsiPropId::get("scaleY");
static PropId PropNameSkewX = JsiPropId::get("skewX");
static PropId PropNameSkewY = JsiPropId::get("skewY");
static PropId PropNameRotate = JsiPropId::get("rotate");
static PropId PropNameRotateZ = JsiPropId::get("rotateZ");

class TransformProp:
public JsiDerivedProp<std::shared_ptr<SkMatrix>> {
public:
  TransformProp(PropId name): JsiDerivedProp<std::shared_ptr<SkMatrix>>() {
    _prop = addChildProp(std::make_shared<JsiProp>(name, PropType::Array));
  }
  
  void updateDerivedValue(JsiDomNodeProps* props) override {
    if (_prop->hasValue() && props->getHasPropChanges(_prop->getName())) {
      if (_prop->getPropValue()->getType() == PropType::Array) {
        auto m = std::make_shared<SkMatrix>(SkMatrix());
        for (auto &el: _prop->getPropValue()->getAsArray()) {
          auto keys = el->getKeys();
          if (keys.size() == 0) {
            throw std::runtime_error("Empty value in transform. Expected translateX, translateY, scale, "
                                     "scaleX, scaleY, skewX, skewY, rotate or rotateZ.");
          }
          auto key = el->getKeys().at(0);
          auto value = el->getValue(key)->getAsNumber();
          if (key == PropNameTranslateX) {
            m->preTranslate(value, 0);
          } else if (key == PropNameTranslateY) {
            m->preTranslate(0, value);
          } else if (key == PropNameScale) {
            m->preScale(value, value);
          } else if (key == PropNameScaleX) {
            m->preScale(value, 1);
          } else if (key == PropNameScaleY) {
            m->preScale(1, value);
          } else if (key == PropNameSkewX) {
            m->preScale(value, 0);
          } else if (key == PropNameSkewY) {
            m->preScale(value, 0);
          } else if (key == PropNameRotate || key == PropNameRotateZ) {
            m->preRotate(SkRadiansToDegrees(value));
          } else {
            throw std::runtime_error("Unknown key in transform. Expected translateX, translateY, scale, "
                                     "scaleX, scaleY, skewX, skewY, rotate or rotateZ - got " + std::string(key) + ".");
          }
        }
        setDerivedValue(m);
      } else {
        throw std::runtime_error("Expected array for transform property, got " +
                                 JsiValue::getTypeAsString(_prop->getPropValue()->getType()));
      }
    }
  }
  
private:
  std::shared_ptr<JsiProp> _prop;
};

}

