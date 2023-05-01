#pragma once

#include <memory>
#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkMatrix.h"

#pragma clang diagnostic pop

namespace RNSkia {

static PropId PropNameTranslateX = JsiPropId::get("translateX");
static PropId PropNameTranslateY = JsiPropId::get("translateY");
static PropId PropNameScale = JsiPropId::get("scale");
static PropId PropNameScaleX = JsiPropId::get("scaleX");
static PropId PropNameScaleY = JsiPropId::get("scaleY");
static PropId PropNameSkewX = JsiPropId::get("skewX");
static PropId PropNameSkewY = JsiPropId::get("skewY");
static PropId PropNameRotate = JsiPropId::get("rotate");
static PropId PropNameRotateZ = JsiPropId::get("rotateZ");

/**
 Implements a converter class that converts to numeric values
 */
class RNSkTransformConverter {
public:
  /**
   Converter
   */
  static std::shared_ptr<SkMatrix> convert(const JsiValue &input) {
    auto matrix = std::make_shared<SkMatrix>();
    for (auto &el : input.getAsArray()) {
      auto keys = el.getKeys();
      if (keys.size() == 0) {
        throw std::runtime_error(
            "Empty value in transform. Expected translateX, translateY, "
            "scale, "
            "scaleX, scaleY, skewX, skewY, rotate or rotateZ.");
      }
      auto key = el.getKeys().at(0);
      auto value = el.getValue(key).getAsNumber();
      if (key == PropNameTranslateX) {
        matrix->preTranslate(value, 0);
      } else if (key == PropNameTranslateY) {
        matrix->preTranslate(0, value);
      } else if (key == PropNameScale) {
        matrix->preScale(value, value);
      } else if (key == PropNameScaleX) {
        matrix->preScale(value, 1);
      } else if (key == PropNameScaleY) {
        matrix->preScale(1, value);
      } else if (key == PropNameSkewX) {
        matrix->preSkew(value, 0);
      } else if (key == PropNameSkewY) {
        matrix->preSkew(0, value);
      } else if (key == PropNameRotate || key == PropNameRotateZ) {
        matrix->preRotate(SkRadiansToDegrees(value));
      } else {
        throw std::runtime_error(
            "Unknown key in transform. Expected translateX, translateY, "
            "scale, "
            "scaleX, scaleY, skewX, skewY, rotate or rotateZ - got " +
            std::string(key) + ".");
      }
    }
    return matrix;
  }

  /**
   Returns true if this interpolator can interpolate this value type
   */
  static bool isConvertable(const JsiValue &value) {
    if (value.getType() != PropType::Array) {
      return false;
    }

    for (auto &el : value.getAsArray()) {
      auto keys = el.getKeys();
      if (keys.size() == 0) {
        return false;
      }
      auto key = el.getKeys().at(0);
      if (key != PropNameTranslateX && key != PropNameTranslateY &&
          key != PropNameScale && key != PropNameScaleX &&
          key != PropNameScaleY && key != PropNameSkewX &&
          key != PropNameSkewY && key != PropNameRotate &&
          key != PropNameRotateZ) {
        return false;
      }
    }
    return true;
  }
};
} // namespace RNSkia
