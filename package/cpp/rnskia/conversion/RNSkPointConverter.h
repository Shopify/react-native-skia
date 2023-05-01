#pragma once

#include <memory>

#include "JsiSkPoint.h"

namespace RNSkia {

static PropId PropNameX = JsiPropId::get("x");
static PropId PropNameY = JsiPropId::get("y");

/**
 Implements a converter class that converts to point values
 */
class RNSkPointConverter {
public:
  /**
   Converts a JsiValue to an SkPoint. If it is not possible to convert, we'll
   return a nullptr.
   */
  static std::shared_ptr<SkPoint> convert(const JsiValue &value) {
    if (value.getType() == PropType::HostObject) {
      // Try reading as point
      auto ptr = std::dynamic_pointer_cast<JsiSkPoint>(value.getAsHostObject());
      if (ptr != nullptr) {
        return ptr->getObject();
      } else {
        // Try reading as rect
        auto ptr =
            std::dynamic_pointer_cast<JsiSkRect>(value.getAsHostObject());
        if (ptr != nullptr) {
          return std::make_shared<SkPoint>(
              SkPoint::Make(ptr->getObject()->x(), ptr->getObject()->y()));
        }
      }
    } else if (value.getType() == PropType::Object &&
               value.hasValue(PropNameX) && value.hasValue(PropNameY)) {
      auto x = value.getValue(PropNameX);
      auto y = value.getValue(PropNameY);
      return std::make_shared<SkPoint>(
          SkPoint::Make(x.getAsNumber(), y.getAsNumber()));
    }
    return nullptr;
  }

  /**
   Returns true if this interpolator can interpolate this value type
   */
  static bool isConvertable(const JsiValue &value) {
    if (value.getType() == PropType::HostObject) {
      // Try reading as point
      auto ptr = std::dynamic_pointer_cast<JsiSkPoint>(value.getAsHostObject());
      if (ptr != nullptr) {
        return true;
      }
    } else if (value.getType() == PropType::Object &&
               value.hasValue(PropNameX) && value.hasValue(PropNameY)) {
      return true;
    }
    return false;
  }
};
} // namespace RNSkia
