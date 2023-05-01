#pragma once

#include <memory>

#include "JsiSkRect.h"
#include "RNSkPointConverter.h"

namespace RNSkia {

static PropId PropNameWidth = JsiPropId::get("width");
static PropId PropNameHeight = JsiPropId::get("height");

/**
 Implements a converter class that converts to numeric values
 */
class RNSkRectConverter {
public:
  /**
   Converts from a JsiValue to a shared pointer containing an SkRect. If the
   JsiValue does not contain a valid SkRect, a nullptr will be returned.
   */
  static std::shared_ptr<SkRect> convert(const JsiValue &value) {
    if (value.getType() == PropType::HostObject) {
      auto rectPtr =
          std::dynamic_pointer_cast<JsiSkRect>(value.getAsHostObject());
      if (rectPtr != nullptr) {
        return rectPtr->getObject();
      }
    } else if (value.getType() == PropType::Object &&
               value.hasValue(PropNameX) && value.hasValue(PropNameY) &&
               value.hasValue(PropNameWidth) &&
               value.hasValue(PropNameHeight)) {
      // Save props for fast access
      auto x = value.getValue(PropNameX);
      auto y = value.getValue(PropNameY);
      auto width = value.getValue(PropNameWidth);
      auto height = value.getValue(PropNameHeight);
      // Update cache from js object value
      return std::make_shared<SkRect>(
          SkRect::MakeXYWH(x.getAsNumber(), y.getAsNumber(),
                           width.getAsNumber(), height.getAsNumber()));
    }
    return nullptr;
  }

  /**
   Returns true if this interpolator can interpolate this value type
   */
  static bool isConvertable(const JsiValue &value) {
    if (value.getType() == PropType::HostObject) {
      auto rectPtr =
          std::dynamic_pointer_cast<JsiSkRect>(value.getAsHostObject());
      if (rectPtr != nullptr) {
        return true;
      }
    } else if (value.getType() == PropType::Object &&
               value.hasValue(PropNameX) && value.hasValue(PropNameY) &&
               value.hasValue(PropNameWidth) &&
               value.hasValue(PropNameHeight)) {
      return true;
    }
    return false;
  }
};
} // namespace RNSkia
