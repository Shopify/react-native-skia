#pragma once

#include <jsi/jsi.h>

namespace RNSkia {

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
    } else if (element.isObject()) {
       auto indexableObj = element.asObject(runtime);
        std::vector<float> values;
        values.reserve(4);
        for (int i = 0; i < 4; i++) {
          if (indexableObj.hasProperty(runtime, std::to_string(i).c_str())) {
            result.push_back(static_cast<float>(
                indexableObj.getProperty(runtime, std::to_string(i).c_str())
                    .asNumber()));
          }
        }
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

// TODO: return the SkRRect directly
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

// Return SkPath instead of shared_ptr<SkPath>
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
  } else if (value.isObject() &&
             value.asObject(runtime).isHostObject(runtime)) {
    auto ptr = std::dynamic_pointer_cast<JsiSkPath>(
        value.asObject(runtime).asHostObject(runtime));
    if (ptr != nullptr) {
      return ptr->getObject();
    }
  }
  return nullptr;
}

} // namespace RNSkia
