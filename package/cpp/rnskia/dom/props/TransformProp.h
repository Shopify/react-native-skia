#pragma once

#include "DerivedNodeProp.h"
#include "JsiSkMatrix.h"

#include <memory>
#include <string>

namespace RNSkia {

static PropId PropNameTranslateX = JsiPropId::get("translateX");
static PropId PropNameTranslateY = JsiPropId::get("translateY");
static PropId PropNameTranslateZ = JsiPropId::get("translateZ");
static PropId PropNameTranslate = JsiPropId::get("translate");
static PropId PropNameScale = JsiPropId::get("scale");
static PropId PropNameScaleX = JsiPropId::get("scaleX");
static PropId PropNameScaleY = JsiPropId::get("scaleY");
static PropId PropNameSkewX = JsiPropId::get("skewX");
static PropId PropNameSkewY = JsiPropId::get("skewY");
static PropId PropNameRotate = JsiPropId::get("rotate");
static PropId PropNameRotateZ = JsiPropId::get("rotateZ");
static PropId PropNameRotateX = JsiPropId::get("rotateX");
static PropId PropNameRotateY = JsiPropId::get("rotateY");
static PropId PropNamePerspective = JsiPropId::get("perspective");
static PropId PropNameMatrix4 = JsiPropId::get("matrix");

class TransformProp : public DerivedProp<SkMatrix> {
public:
  explicit TransformProp(PropId name,
                         const std::function<void(BaseNodeProp *)> &onChange)
      : DerivedProp<SkMatrix>(onChange) {
    _transformProp = defineProperty<NodeProp>(name);
  }

  void updateDerivedValue() override {
    if (!_transformProp->isSet()) {
      setDerivedValue(nullptr);
    } else if (_transformProp->value().getType() != PropType::Array) {
      throw std::runtime_error(
          "Expected array for transform property, got " +
          JsiValue::getTypeAsString(_transformProp->value().getType()));
    } else {
      SkM44 m4;
      auto m = std::make_shared<SkMatrix>(SkMatrix());
      for (auto &el : _transformProp->value().getAsArray()) {
        auto keys = el.getKeys();
        if (keys.size() == 0) {
          throw std::runtime_error(
              "Empty value in transform. Expected translateX, translateY, "
              "scale, "
              "scaleX, scaleY, skewX, skewY, rotate or rotateZ.");
        }
        auto key = el.getKeys().at(0);
        if (key == PropNameTranslateX) {
          auto x = el.getValue(key).getAsNumber();
          SkM44 trX(1, 0, 0, x, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          m4.preConcat(trX);
        } else if (key == PropNameTranslateY) {
          auto y = el.getValue(key).getAsNumber();
          SkM44 trY(1, 0, 0, 0, 0, 1, 0, y, 0, 0, 1, 0, 0, 0, 0, 1);
          m4.preConcat(trY);
        } else if (key == PropNameTranslateZ) {
          auto z = el.getValue(key).getAsNumber();
          SkM44 trZ(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, z, 0, 0, 0, 1);
          m4.preConcat(trZ);
        } else if (key == PropNameTranslate) {
          auto arr = el.getValue(key).getAsArray();
          double x = 0, y = 0, z = 0;
          for (size_t i = 0; i < arr.size(); ++i) {
            if (i == 0) {
              x = arr[i].getAsNumber();
            } else if (i == 1) {
              y = arr[i].getAsNumber();
            } else if (i == 2) {
              z = arr[i].getAsNumber();
            }
          }
          SkM44 tr(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
          m4.preConcat(tr);
        } else if (key == PropNameScale) {
          auto s = el.getValue(key).getAsNumber();
          SkM44 scale(s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          m4.preConcat(scale);
        } else if (key == PropNameScaleX) {
          auto s = el.getValue(key).getAsNumber();
          SkM44 scale(s, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          m4.preConcat(scale);
        } else if (key == PropNameScaleY) {
          auto s = el.getValue(key).getAsNumber();
          SkM44 scale(1, 0, 0, 0, 0, s, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          m4.preConcat(scale);
        } else if (key == PropNameSkewX) {
          auto angle = el.getValue(key).getAsNumber();
          SkM44 skewX(1, 0, 0, 0, std::tan(angle), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0,
                      1);
          m4.preConcat(skewX);
        } else if (key == PropNameSkewY) {
          auto angle = el.getValue(key).getAsNumber();
          SkM44 skewY(1, std::tan(angle), 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0,
                      1);
          m4.preConcat(skewY);
        } else if (key == PropNameRotate || key == PropNameRotateZ) {
          auto angle = el.getValue(key).getAsNumber();
          SkM44 rotate;
          rotate.setRotateUnit({0, 0, 1}, angle);
          m4.preConcat(rotate);
        } else if (key == PropNameRotateY) {
          auto angle = el.getValue(key).getAsNumber();
          SkM44 rotate;
          rotate.setRotateUnit({0, 1, 0}, angle);
          m4.preConcat(rotate);
        } else if (key == PropNameRotateX) {
          auto angle = el.getValue(key).getAsNumber();
          SkM44 rotate;
          rotate.setRotateUnit({1, 0, 0}, angle);
          m4.preConcat(rotate);
        } else if (key == PropNamePerspective) {
          auto p = el.getValue(key).getAsNumber();
          SkM44 perspective(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1 / p,
                            1);
          m4.preConcat(perspective);
        } else if (key == PropNameMatrix4) {
          auto arr = el.getValue(key).getAsArray();
          SkM44 m44;
          for (size_t i = 0; i < arr.size(); ++i) {
            auto obj = arr[i];
            m44.setRC(i / 4, i % 4, obj.getAsNumber());
          }
          m4.preConcat(m44);
        } else {
          throw std::runtime_error(
              "Unknown key in transform. Expected translateX, translateY, "
              "scale, "
              "scaleX, scaleY, skewX, skewY, rotate or rotateZ - got " +
              std::string(key) + ".");
        }
      }
      m->preConcat(m4.asM33());
      setDerivedValue(m);
    }
  }

private:
  NodeProp *_transformProp;
};

} // namespace RNSkia
