#pragma once

#include <jsi/jsi.h>

#include "JsiSkMatrix.h"
#include "JsiSkPath.h"
#include "JsiSkRRect.h"
#include "JsiSkRect.h"

namespace RNSkia {

static SkM44 processTransform(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isObject()) {
    auto object = value.asObject(runtime);
    if (object.isArray(runtime)) {
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
        auto key = propNames.getValueAtIndex(runtime, 0).asString(runtime).utf8(runtime);
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
          auto arr = value.getProperty(runtime, key.c_str()).asObject(runtime).asArray(runtime);
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
          SkM44 perspective(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1 / p,
                            1);
          m4.preConcat(perspective);
        } else if (key == "matrix") {
          auto arr = value.getProperty(runtime, key.c_str()).asObject(runtime).asArray(runtime);
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
  }
  throw std::runtime_error("Expected object for transform property.");
}

static SkMatrix processMatrix(jsi::Runtime &runtime, const jsi::Value &value) {
  if (value.isObject()) {
    auto object = value.asObject(runtime);
    if (object.isHostObject(runtime)) {
      auto ptr =
          std::dynamic_pointer_cast<JsiSkMatrix>(object.asHostObject(runtime));
      if (ptr != nullptr) {
        return SkMatrix(*ptr->getObject());
      }
    } else if (object.isArray(runtime)) {
      SkMatrix m3;
      auto array = object.asArray(runtime);
      auto size = array.size(runtime);
      if (size == 9) {
        for (size_t i = 0; i < size; ++i) {
          auto a = array.getValueAtIndex(runtime, i);
          m3.set(i, a.asNumber());
        }
      } else {
        SkM44 m4;
        for (size_t i = 0; i < size; ++i) {
          auto a = array.getValueAtIndex(runtime, i);
          m4.setRC(i / 4, i % 4, a.asNumber());
        }
        auto m = m4.asM33();
        m3.setAll(m.rc(0, 0), m.rc(0, 1), m.rc(0, 2), m.rc(1, 0), m.rc(1, 1),
                  m.rc(1, 2), m.rc(2, 0), m.rc(2, 1), m.rc(2, 2));
      }
      return m3;
    }
  }
  throw std::runtime_error("Couldn't read matrix value");
}

static std::shared_ptr<SkPath> processPath(jsi::Runtime &runtime,
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

static std::shared_ptr<SkRect> processRect(jsi::Runtime &runtime,
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

static SkPoint processPoint(jsi::Runtime &runtime, const jsi::Value &value) {
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

static std::shared_ptr<SkRRect> processRRect(jsi::Runtime &runtime,
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

} // namespace RNSkia
