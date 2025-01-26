#pragma once

#include <functional>
#include <map>
#include <optional>
#include <variant>
#include <vector>

#include <include/core/SkBlurTypes.h>
#include <include/core/SkPaint.h>
#include <include/core/SkPoint.h>
#include <include/effects/SkRuntimeEffect.h>

#include "third_party/CSSColorParser.h"

#include <jsi/jsi.h>

namespace RNSkia {

using ConversionFunction =
    std::function<void(jsi::Runtime &runtime, const jsi::Object &object)>;
using Variables = std::map<std::string, std::vector<ConversionFunction>>;

bool isSharedValue(jsi::Runtime &runtime, const jsi::Value &value) {
  return value.isObject() &&
         value.asObject(runtime).hasProperty(runtime,
                                             "_isReanimatedSharedValue") &&
         value.asObject(runtime)
             .getProperty(runtime, "_isReanimatedSharedValue")
             .isBool() &&
         value.asObject(runtime)
                 .getProperty(runtime, "_isReanimatedSharedValue")
                 .asBool() == true;
}

// Helper type traits
template <typename T> struct is_optional : std::false_type {};

template <typename T> struct is_optional<std::optional<T>> : std::true_type {};

template <typename T> struct unwrap_optional {
  using type = T;
};

template <typename T> struct unwrap_optional<std::optional<T>> {
  using type = T;
};

// Property value getter declarations
template <typename T>
T getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value);

// Base template for convertProperty
template <typename T, typename Target>
void convertPropertyImpl(jsi::Runtime &runtime, const jsi::Object &object,
                         const std::string &propertyName, Target &target,
                         Variables &variables) {
  if (!object.hasProperty(runtime, propertyName.c_str())) {
    return;
  }

  auto property = object.getProperty(runtime, propertyName.c_str());

  if (isSharedValue(runtime, property)) {
    auto sharedValue = property.asObject(runtime);
    auto name = sharedValue.getProperty(runtime, "name")
                    .asString(runtime)
                    .utf8(runtime);
    auto conv = [target = &target](jsi::Runtime &runtime,
                                   const jsi::Object &val) {
      auto value = val.getProperty(runtime, "value");
      *target = getPropertyValue<T>(runtime, value);
    };
    variables[name].push_back(conv);
    conv(runtime, sharedValue);
  } else {
    target = getPropertyValue<T>(runtime, property);
  }
}

// Main convertProperty template
template <typename T>
void convertProperty(jsi::Runtime &runtime, const jsi::Object &object,
                     const std::string &propertyName, T &target,
                     Variables &variables) {
  convertPropertyImpl<T>(runtime, object, propertyName, target, variables);
}

// Base property value getter implementations
template <>
float getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isNumber()) {
    return static_cast<float>(value.asNumber());
  }
  throw std::runtime_error("Invalid prop value received");
}

template <>
std::string getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isString()) {
    return value.asString(runtime).utf8(runtime);
  }
  throw std::runtime_error("Invalid prop value received");
}

template <>
SkPoint getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isObject()) {
    auto x = value.asObject(runtime).getProperty(runtime, "x").asNumber();
    auto y = value.asObject(runtime).getProperty(runtime, "y").asNumber();
    return SkPoint::Make(x, y);
  }
  throw std::runtime_error("Invalid prop value for SkPoint received");
}

template <>
SkM44 getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isObject()) {
    auto object = value.asObject(runtime);
    // Get array of property names
    auto array = object.asArray(runtime);
    auto size = array.size(runtime);
    SkM44 m4;
    for (int i = 0; i < size; i++) {
      auto value = array.getValueAtIndex(runtime, i).asObject(runtime);
      auto propNames = value.getPropertyNames(runtime);
      if (propNames.size(runtime) == 0) {
        throw std::runtime_error(
            "Empty value in transform. Expected translateX, translateY, "
            "scale, "
            "scaleX, scaleY, skewX, skewY, rotate or rotateZ.");
      }
      auto key =
          propNames.getValueAtIndex(runtime, 0).asString(runtime).utf8(runtime);
      if (key == "translateX") {
        auto x = value.getProperty(runtime, key.c_str()).asNumber();
        SkM44 trX(1, 0, 0, x, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        m4.preConcat(trX);
      } else if (key == "translateY") {
        auto y = value.getProperty(runtime, key.c_str()).asNumber();
        SkM44 trY(1, 0, 0, 0, 0, 1, 0, y, 0, 0, 1, 0, 0, 0, 0, 1);
        m4.preConcat(trY);
      } else if (key == "translateZ") {
        auto z = value.getProperty(runtime, key.c_str()).asNumber();
        SkM44 trZ(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, z, 0, 0, 0, 1);
        m4.preConcat(trZ);
      } else if (key == "translate") {
        auto arr = value.getProperty(runtime, key.c_str())
                       .asObject(runtime)
                       .asArray(runtime);
        double x = 0, y = 0, z = 0;
        for (int i; i < arr.size(runtime); i++) {
          if (i == 0) {
            x = arr.getValueAtIndex(runtime, i).asNumber();
          } else if (i == 1) {
            y = arr.getValueAtIndex(runtime, i).asNumber();
          } else if (i == 2) {
            z = arr.getValueAtIndex(runtime, i).asNumber();
          }
        }
        SkM44 tr(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
        m4.preConcat(tr);
      } else if (key == "scale") {
        auto s = value.getProperty(runtime, key.c_str()).asNumber();
        SkM44 scale(s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        m4.preConcat(scale);
      } else if (key == "scaleX") {
        auto s = value.getProperty(runtime, key.c_str()).asNumber();
        SkM44 scale(s, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        m4.preConcat(scale);
      } else if (key == "scaleY") {
        auto s = value.getProperty(runtime, key.c_str()).asNumber();
        SkM44 scale(1, 0, 0, 0, 0, s, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        m4.preConcat(scale);
      } else if (key == "skewX") {
        auto angle = value.getProperty(runtime, key.c_str()).asNumber();
        SkM44 skewX(1, 0, 0, 0, std::tan(angle), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0,
                    1);
        m4.preConcat(skewX);

      } else if (key == "skewY") {
        auto angle = value.getProperty(runtime, key.c_str()).asNumber();
        SkM44 skewY(1, std::tan(angle), 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0,
                    1);
        m4.preConcat(skewY);
      } else if (key == "rotate" || key == "rotateZ") {
        auto angle = value.getProperty(runtime, key.c_str()).asNumber();
        SkM44 rotate;
        rotate.setRotateUnit({0, 0, 1}, angle);
        m4.preConcat(rotate);
      } else if (key == "rotateY") {
        auto angle = value.getProperty(runtime, key.c_str()).asNumber();
        SkM44 rotate;
        rotate.setRotateUnit({0, 1, 0}, angle);
        m4.preConcat(rotate);
      } else if (key == "rotateX") {
        auto angle = value.getProperty(runtime, key.c_str()).asNumber();
        SkM44 rotate;
        rotate.setRotateUnit({1, 0, 0}, angle);
        m4.preConcat(rotate);
      } else if (key == "perspective") {
        auto p = value.getProperty(runtime, key.c_str()).asNumber();
        SkM44 perspective(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1 / p, 1);
        m4.preConcat(perspective);
      } else if (key == "matrix") {
        auto arr = value.getProperty(runtime, key.c_str())
                       .asObject(runtime)
                       .asArray(runtime);
        SkM44 m44;
        for (size_t i = 0; i < arr.size(runtime); ++i) {
          auto obj = arr.getValueAtIndex(runtime, i);
          m44.setRC(i / 4, i % 4, obj.asNumber());
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
    return m4;
  }
  throw std::runtime_error("Invalid prop value for SkM44 received");
}

template <>
SkFont getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isObject()) {
    auto font =
        value.asObject(runtime).asHostObject<JsiSkFont>(runtime)->getObject();
    return SkFont(*font);
  }
  throw std::runtime_error("Invalid prop value for SkFont received");
}

template <>
sk_sp<SkRuntimeEffect> getPropertyValue(jsi::Runtime &runtime,
                                        const jsi::Value &value) {
  if (value.isObject()) {
    auto effect = value.asObject(runtime)
                      .asHostObject<JsiSkRuntimeEffect>(runtime)
                      ->getObject();
    return effect;
  }
  throw std::runtime_error("Invalid prop value for SkRuntimeEffect received");
}

template <>
SkMatrix getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isObject()) {
    auto object = value.asObject(runtime);

    if (object.isHostObject(runtime)) {
      auto matrix =
          object.asHostObject<JsiSkMatrix>(runtime)->getObject().get();
      return SkMatrix(*matrix);
    } else {
      return JsiSkMatrix::getMatrix(runtime, value);
    }
  }
  throw std::runtime_error("Invalid prop value for SkMatrix received");
}

template <>
SkPaint::Style getPropertyValue(jsi::Runtime &runtime, const jsi::Value &val) {
  if (val.isString()) {
    auto value = val.asString(runtime).utf8(runtime);
    if (value == "fill") {
      return SkPaint::kFill_Style;
    } else if (value == "stroke") {
      return SkPaint::kStroke_Style;
    }
  }
  throw std::runtime_error("Invalid prop value for SkPaint::Style received");
}

template <>
SkPaint::Join getPropertyValue(jsi::Runtime &runtime, const jsi::Value &val) {
  if (val.isString()) {
    auto value = val.asString(runtime).utf8(runtime);
    if (value == "miter") {
      return SkPaint::kMiter_Join;
    } else if (value == "round") {
      return SkPaint::kRound_Join;
    } else if (value == "bevel") {
      return SkPaint::kBevel_Join;
    }
  }
  throw std::runtime_error("Invalid prop value for SkPaint::Join received");
}

template <>
SkPaint::Cap getPropertyValue(jsi::Runtime &runtime, const jsi::Value &val) {
  if (val.isString()) {
    auto value = val.asString(runtime).utf8(runtime);
    if (value == "butt") {
      return SkPaint::kButt_Cap;
    } else if (value == "round") {
      return SkPaint::kRound_Cap;
    } else if (value == "square") {
      return SkPaint::kSquare_Cap;
    }
  }
  throw std::runtime_error("Invalid prop value for SkPaint::Cap received");
}

template <>
SkBlendMode getPropertyValue(jsi::Runtime &runtime, const jsi::Value &val) {
  if (val.isString()) {
    auto value = val.asString(runtime).utf8(runtime);
    if (value == "clear") {
      return SkBlendMode::kClear;
    } else if (value == "src") {
      return SkBlendMode::kSrc;
    } else if (value == "dst") {
      return SkBlendMode::kDst;
    } else if (value == "srcOver") {
      return SkBlendMode::kSrcOver;
    } else if (value == "dstOver") {
      return SkBlendMode::kDstOver;
    } else if (value == "srcIn") {
      return SkBlendMode::kSrcIn;
    } else if (value == "dstIn") {
      return SkBlendMode::kDstIn;
    } else if (value == "srcOut") {
      return SkBlendMode::kSrcOut;
    } else if (value == "dstOut") {
      return SkBlendMode::kDstOut;
    } else if (value == "srcATop") {
      return SkBlendMode::kSrcATop;
    } else if (value == "dstATop") {
      return SkBlendMode::kDstATop;
    } else if (value == "xor") {
      return SkBlendMode::kXor;
    } else if (value == "plus") {
      return SkBlendMode::kPlus;
    } else if (value == "modulate") {
      return SkBlendMode::kModulate;
    } else if (value == "screen") {
      return SkBlendMode::kScreen;
    } else if (value == "overlay") {
      return SkBlendMode::kOverlay;
    } else if (value == "darken") {
      return SkBlendMode::kDarken;
    } else if (value == "lighten") {
      return SkBlendMode::kLighten;
    } else if (value == "colorDodge") {
      return SkBlendMode::kColorDodge;
    } else if (value == "colorBurn") {
      return SkBlendMode::kColorBurn;
    } else if (value == "hardLight") {
      return SkBlendMode::kHardLight;
    } else if (value == "softLight") {
      return SkBlendMode::kSoftLight;
    } else if (value == "difference") {
      return SkBlendMode::kDifference;
    } else if (value == "exclusion") {
      return SkBlendMode::kExclusion;
    } else if (value == "multiply") {
      return SkBlendMode::kMultiply;
    } else if (value == "hue") {
      return SkBlendMode::kHue;
    } else if (value == "saturation") {
      return SkBlendMode::kSaturation;
    } else if (value == "color") {
      return SkBlendMode::kColor;
    } else if (value == "luminosity") {
      return SkBlendMode::kLuminosity;
    }
  }
  throw std::runtime_error("Invalid prop value for SkBlendMode received");
}

template <>
SkColor getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isNumber()) {
    return static_cast<SkColor>(value.asNumber());
  } else if (value.isString()) {
    auto text = value.asString(runtime).utf8(runtime);
    auto color = CSSColorParser::parse(text);
    if (color.a == -1.0f) {
      return SK_ColorBLACK;
    }
    return SkColorSetARGB(color.a * 255, color.r, color.g, color.b);
  } else if (value.isObject()) {
    const auto &object = value.asObject(runtime);
    if (object.isArray(runtime)) {
      auto array = object.asArray(runtime);
      auto r = array.getValueAtIndex(runtime, 0).asNumber();
      auto g = array.getValueAtIndex(runtime, 1).asNumber();
      auto b = array.getValueAtIndex(runtime, 2).asNumber();
      auto a = array.getValueAtIndex(runtime, 3).asNumber();
      return SkColorSetARGB(a * 255, r * 255, g * 255, b * 255);
    }
    jsi::ArrayBuffer buffer =
        object
            .getProperty(runtime, jsi::PropNameID::forAscii(runtime, "buffer"))
            .asObject(runtime)
            .getArrayBuffer(runtime);
    auto bfrPtr = reinterpret_cast<float *>(buffer.data(runtime));
    if (bfrPtr[0] > 1 || bfrPtr[1] > 1 || bfrPtr[2] > 1 || bfrPtr[3] > 1) {
      return SK_ColorBLACK;
    }
    return SkColorSetARGB(bfrPtr[3] * 255, bfrPtr[0] * 255, bfrPtr[1] * 255,
                          bfrPtr[2] * 255);
  }
  throw std::runtime_error("Invalid prop value for SkColor received");
}

std::shared_ptr<SkPath> processPath(jsi::Runtime &runtime,
                                    const jsi::Value &value) {
  if (value.isString()) {
    auto pathString = value.getString(runtime).utf8(runtime);
    SkPath result;

    if (SkParsePath::FromSVGString(pathString.c_str(), &result)) {
      return std::make_shared<SkPath>(result);
    } else {
      throw std::runtime_error("Could not parse path from string.");
    }
  } else if (value.isObject()) {
    auto ptr = std::dynamic_pointer_cast<JsiSkPath>(
        value.asObject(runtime).asHostObject(runtime));
    if (ptr != nullptr) {
      return ptr->getObject();
    }
  }
  return nullptr;
}

std::shared_ptr<SkRect> processRect(jsi::Runtime &runtime,
                                    const jsi::Value &value) {
  if (value.isObject()) {
    auto object = value.asObject(runtime);
    if (object.isHostObject(runtime)) {
      auto ptr = std::dynamic_pointer_cast<JsiSkRect>(
          value.asObject(runtime).asHostObject(runtime));
      if (ptr != nullptr) {
        return ptr->getObject();
      }
    } else if (object.hasProperty(runtime, "x") &&
               object.hasProperty(runtime, "y") &&
               object.hasProperty(runtime, "width") &&
               object.hasProperty(runtime, "height")) {
      auto x = object.getProperty(runtime, "x").getNumber();
      auto y = object.getProperty(runtime, "y").getNumber();
      auto width = object.getProperty(runtime, "width").getNumber();
      auto height = object.getProperty(runtime, "height").getNumber();
      return std::make_shared<SkRect>(SkRect::MakeXYWH(x, y, width, height));
    }
  }
  return nullptr;
}

SkPoint processPoint(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isObject()) {
    auto object = value.asObject(runtime);
    if (object.hasProperty(runtime, "x") && object.hasProperty(runtime, "y")) {
      auto x = static_cast<float>(object.getProperty(runtime, "x").getNumber());
      auto y = static_cast<float>(object.getProperty(runtime, "y").getNumber());
      return SkPoint::Make(x, y);
    }
  }
  throw std::runtime_error("Couldn't read point value");
};

std::shared_ptr<SkRRect> processRRect(jsi::Runtime &runtime,
                                      const jsi::Value &value) {
  if (value.isObject()) {
    auto object = value.asObject(runtime);
    if (object.isHostObject(runtime)) {
      auto ptr = std::dynamic_pointer_cast<JsiSkRRect>(
          value.asObject(runtime).asHostObject(runtime));
      if (ptr != nullptr) {
        return ptr->getObject();
      }
    } else if (object.hasProperty(runtime, "rect") &&
               object.hasProperty(runtime, "rx") &&
               object.hasProperty(runtime, "ry")) {
      auto rect = processRect(runtime, object.getProperty(runtime, "rect"));
      auto rx = object.getProperty(runtime, "rx").getNumber();
      auto ry = object.getProperty(runtime, "ry").getNumber();
      return std::make_shared<SkRRect>(SkRRect::MakeRectXY(*rect, rx, ry));
    } else if (object.hasProperty(runtime, "rect") &&
               object.hasProperty(runtime, "topLeft") &&
               object.hasProperty(runtime, "topRight") &&
               object.hasProperty(runtime, "bottomRight") &&
               object.hasProperty(runtime, "bottomLeft")) {
      auto rect = processRect(runtime, object.getProperty(runtime, "rect"));
      auto topLeft =
          processPoint(runtime, object.getProperty(runtime, "topLeft"));
      auto topRight =
          processPoint(runtime, object.getProperty(runtime, "topRight"));
      auto bottomRight =
          processPoint(runtime, object.getProperty(runtime, "bottomRight"));
      auto bottomLeft =
          processPoint(runtime, object.getProperty(runtime, "bottomLeft"));
      auto result = std::make_shared<SkRRect>(SkRRect::MakeRectXY(*rect, 0, 0));
      const SkVector corners[4] = {topLeft, topRight, bottomRight, bottomLeft};
      result->setRectRadii(*rect, corners);
      return result;
    }
  }
  return nullptr;
}

using ClipDef = std::variant<SkPath, SkRRect, SkRect, std::string>;
using Layer = std::variant<SkPaint, bool>;
using Uniforms = std::map<std::string, std::vector<float>>;

std::vector<float> processArray(jsi::Runtime &runtime,
                                const jsi::Array &array) {
  std::vector<float> result;
  size_t length = array.length(runtime);
  result.reserve(length);

  for (size_t i = 0; i < length; i++) {
    jsi::Value element = array.getValueAtIndex(runtime, i);
    if (element.isNumber()) {
      result.push_back(static_cast<float>(element.asNumber()));
    } else if (element.isObject() &&
               element.asObject(runtime).isArray(runtime)) {
      auto subArray =
          processArray(runtime, element.asObject(runtime).asArray(runtime));
      result.insert(result.end(), subArray.begin(), subArray.end());
    }
  }
  return result;
}

bool isJSPoint(jsi::Runtime &runtime, const jsi::Value &value) {
  return value.isObject() &&
         value.asObject(runtime).hasProperty(runtime, "x") &&
         value.asObject(runtime).hasProperty(runtime, "y");
}

bool isIndexable(jsi::Runtime &runtime, const jsi::Value &value) {
  return value.isObject() && value.asObject(runtime).hasProperty(runtime, "0");
}

template <>
Uniforms getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isObject()) {
    Uniforms result;
    auto obj = value.asObject(runtime);
    auto names = obj.getPropertyNames(runtime);

    for (size_t i = 0; i < names.length(runtime); i++) {
      std::string propName =
          names.getValueAtIndex(runtime, i).toString(runtime).utf8(runtime);
      jsi::Value propValue = obj.getProperty(runtime, propName.c_str());

      if (propValue.isNumber()) {
        result[propName] =
            std::vector<float>{static_cast<float>(propValue.asNumber())};
      } else if (propValue.isObject() &&
                 propValue.asObject(runtime).isArray(runtime)) {
        result[propName] =
            processArray(runtime, propValue.asObject(runtime).asArray(runtime));
      } else if (propValue.isObject() && isJSPoint(runtime, propValue)) {
        result[propName] = {static_cast<float>(propValue.asObject(runtime)
                                                   .getProperty(runtime, "x")
                                                   .asNumber()),
                            static_cast<float>(propValue.asObject(runtime)
                                                   .getProperty(runtime, "y")
                                                   .asNumber())};
      } else if (propValue.isObject() && isIndexable(runtime, propValue)) {
        auto indexableObj = propValue.asObject(runtime);
        std::vector<float> values;
        values.reserve(4);
        for (int i = 0; i < 4; i++) {
          if (indexableObj.hasProperty(runtime, std::to_string(i).c_str())) {
            values.push_back(static_cast<float>(
                indexableObj.getProperty(runtime, std::to_string(i).c_str())
                    .asNumber()));
          }
        }
        result[propName] = values;
      }
    }
    return result;
  }

  throw std::runtime_error("Invalid prop value for Uniforms received");
}

template <>
SkBlurStyle getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isString()) {
    auto valueStr = value.asString(runtime).utf8(runtime);
    if (valueStr == "normal") {
      return SkBlurStyle::kNormal_SkBlurStyle;
    } else if (valueStr == "solid") {
      return SkBlurStyle::kSolid_SkBlurStyle;
    } else if (valueStr == "outer") {
      return SkBlurStyle::kOuter_SkBlurStyle;
    } else if (valueStr == "inner") {
      return SkBlurStyle::kInner_SkBlurStyle;
    }
  }
  throw std::runtime_error("Invalid prop value for SkBlurStyle received");
}

template <>
SkRect getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isObject()) {
    auto rect = processRect(runtime, value);
    if (!rect) {
      throw std::runtime_error("Invalid prop value for SkRect received");
    }
    return SkRect(*rect);
  }
  throw std::runtime_error("Invalid prop value for SkRect received");
}

template <>
ClipDef getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isObject()) {
    auto path = processPath(runtime, value);
    if (path) {
      ClipDef def = SkPath(*path);
      return def;
    }
    auto rect = processRect(runtime, value);
    if (rect) {
      ClipDef def = SkRect(*rect);
      return def;
    }
    auto rrect = processRRect(runtime, value);
    if (rrect) {
      ClipDef def = SkRRect(*rrect);
      return def;
    }
  } else if (value.isString()) {
    auto pathString = value.asString(runtime).utf8(runtime);
    ClipDef clip = pathString;
    return clip;
  }
  throw std::runtime_error("Invalid prop value for ClipDef received");
}

template <>
Layer getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isBool()) {
    Layer layer = value.asBool();
    return layer;
  } else if (value.isObject() &&
             value.asObject(runtime).isHostObject(runtime)) {
    auto paint =
        value.asObject(runtime).asHostObject<JsiSkPaint>(runtime)->getObject();
    Layer layer = SkPaint(*paint);
    return layer;
  }
  throw std::runtime_error("Invalid prop value for Layer received");
}

template <>
bool getPropertyValue(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isBool()) {
    return value.asBool();
  }
  throw std::runtime_error("Invalid prop value for bool received");
}

//
template <typename T>
std::optional<T> makeOptionalPropertyValue(jsi::Runtime &runtime,
                                           const jsi::Value &value) {
  if (value.isNull() || value.isUndefined()) {
    return std::nullopt;
  }
  try {
    return getPropertyValue<T>(runtime, value);
  } catch (const std::runtime_error &) {
    return std::nullopt;
  }
}

template <>
std::optional<float> getPropertyValue(jsi::Runtime &runtime,
                                      const jsi::Value &value) {
  return makeOptionalPropertyValue<float>(runtime, value);
}

template <>
std::optional<SkPoint> getPropertyValue(jsi::Runtime &runtime,
                                        const jsi::Value &value) {
  return makeOptionalPropertyValue<SkPoint>(runtime, value);
}

template <>
std::optional<SkColor> getPropertyValue(jsi::Runtime &runtime,
                                        const jsi::Value &value) {
  return makeOptionalPropertyValue<SkColor>(runtime, value);
}

template <>
std::optional<SkBlendMode> getPropertyValue(jsi::Runtime &runtime,
                                            const jsi::Value &value) {
  return makeOptionalPropertyValue<SkBlendMode>(runtime, value);
}

template <>
std::optional<SkMatrix> getPropertyValue(jsi::Runtime &runtime,
                                         const jsi::Value &value) {
  return makeOptionalPropertyValue<SkMatrix>(runtime, value);
}

template <>
std::optional<SkM44> getPropertyValue(jsi::Runtime &runtime,
                                      const jsi::Value &value) {
  return makeOptionalPropertyValue<SkM44>(runtime, value);
}

template <>
std::optional<bool> getPropertyValue(jsi::Runtime &runtime,
                                     const jsi::Value &value) {
  return makeOptionalPropertyValue<bool>(runtime, value);
}

template <>
std::optional<ClipDef> getPropertyValue(jsi::Runtime &runtime,
                                        const jsi::Value &value) {
  return makeOptionalPropertyValue<ClipDef>(runtime, value);
}

template <>
std::optional<Layer> getPropertyValue(jsi::Runtime &runtime,
                                      const jsi::Value &value) {
  return makeOptionalPropertyValue<Layer>(runtime, value);
}

template <>
std::optional<SkFont> getPropertyValue(jsi::Runtime &runtime,
                                       const jsi::Value &value) {
  return makeOptionalPropertyValue<SkFont>(runtime, value);
}

template <>
std::optional<SkPaint::Style> getPropertyValue(jsi::Runtime &runtime,
                                               const jsi::Value &value) {
  return makeOptionalPropertyValue<SkPaint::Style>(runtime, value);
}

template <>
std::optional<SkPaint::Join> getPropertyValue(jsi::Runtime &runtime,
                                              const jsi::Value &value) {
  return makeOptionalPropertyValue<SkPaint::Join>(runtime, value);
}

template <>
std::optional<SkPaint::Cap> getPropertyValue(jsi::Runtime &runtime,
                                             const jsi::Value &value) {
  return makeOptionalPropertyValue<SkPaint::Cap>(runtime, value);
}

template <>
std::optional<SkRect> getPropertyValue(jsi::Runtime &runtime,
                                             const jsi::Value &value) {
  return makeOptionalPropertyValue<SkRect>(runtime, value);
}

} // namespace RNSkia
