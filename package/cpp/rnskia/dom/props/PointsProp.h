#pragma once

#include "DerivedNodeProp.h"
#include "JsiSkPoint.h"

#include <memory>
#include <string>
#include <utility>
#include <vector>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPoint.h>

#pragma clang diagnostic pop

namespace RNSkia {

class PointModeProp : public DerivedProp<SkCanvas::PointMode> {
public:
  explicit PointModeProp(PropId name,
                         PropertyDidUpdateCallback &propertyDidUpdate)
      : DerivedProp<SkCanvas::PointMode>(propertyDidUpdate) {
    _pointModeProp = addProperty<NodeProp>(name);
  }

  void updateDerivedValue() override {
    if (_pointModeProp->isSet()) {
      setDerivedValue(
          getPointModeFromStringValue(_pointModeProp->value().getAsString()));
    } else {
      setDerivedValue(nullptr);
    }
  }

private:
  static SkCanvas::PointMode
  getPointModeFromStringValue(const std::string &value) {
    if (value == "points") {
      return SkCanvas::PointMode::kPoints_PointMode;
    } else if (value == "lines") {
      return SkCanvas::PointMode::kLines_PointMode;
    } else if (value == "polygon") {
      return SkCanvas::PointMode::kPolygon_PointMode;
    }
    throw std::runtime_error(
        "Expected valid point mode for Points node, got \"" + value + "\".");
  }

  NodeProp *_pointModeProp;
};

class PointsProp : public DerivedProp<std::vector<SkPoint>> {
public:
  explicit PointsProp(PropId name, PropertyDidUpdateCallback &propertyDidUpdate)
      : DerivedProp<std::vector<SkPoint>>(propertyDidUpdate) {
    _pointsProp = addProperty<NodeProp>(name);
  }

  void updateDerivedValue() override {
    if (_pointsProp->isSet()) {
      auto pointsArray = _pointsProp->value().getAsArray();
      std::vector<SkPoint> points;
      points.reserve(pointsArray.size());
      for (size_t i = 0; i < pointsArray.size(); ++i) {
        auto p = pointsArray[i];
        auto point = PointProp::processValue(p);
        if (point != EmptyPoint) {
          points.push_back(point);
        } else {
          throw std::runtime_error(
              "Expected array of points for points property.");
        }
      }
      setDerivedValue(std::move(points));
    } else {
      setDerivedValue(nullptr);
    }
  }

private:
  NodeProp *_pointsProp;
};

} // namespace RNSkia
