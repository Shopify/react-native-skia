#pragma once

#include <memory>

#include "JsiSkRRect.h"
#include "RNSkRectConverter.h"

namespace RNSkia {

static PropId PropNameRect = JsiPropId::get("rect");
static PropId PropNameRx = JsiPropId::get("rx");
static PropId PropNameRy = JsiPropId::get("ry");
static PropId PropNameR = JsiPropId::get("r");

/**
 Implements a converter class that converts to numeric values
 */
class RNSkRRectConverter {
public:
  /**
   Converts a JsiValue to a valid SkRect structure. If the value can not be
   converted, nullptr is returned.
   */
  static std::shared_ptr<SkRRect> convert(const JsiValue &value) {
    if (value.getType() == PropType::HostObject) {
      // Try reading as rect
      auto rrectPtr =
          std::dynamic_pointer_cast<JsiSkRRect>(value.getAsHostObject());
      if (rrectPtr != nullptr) {
        return rrectPtr->getObject();
      }
    } else {
      if (value.getType() == PropType::Object) {
        if (value.hasValue(PropNameRect) && value.hasValue(PropNameRx) &&
            value.hasValue(PropNameRy)) {
          auto rect = value.getValue(PropNameRect);
          if (rect.hasValue(PropNameX) && rect.hasValue(PropNameY) &&
              rect.hasValue(PropNameWidth) && rect.hasValue(PropNameHeight)) {
            auto x = rect.getValue(PropNameX);
            auto y = rect.getValue(PropNameY);
            auto width = rect.getValue(PropNameWidth);
            auto height = rect.getValue(PropNameHeight);
            auto rx = value.getValue(PropNameRx);
            auto ry = value.getValue(PropNameRy);

            // Update cache from js object value
            return std::make_shared<SkRRect>(SkRRect::MakeRectXY(
                SkRect::MakeXYWH(x.getAsNumber(), y.getAsNumber(),
                                 width.getAsNumber(), height.getAsNumber()),
                rx.getAsNumber(), ry.getAsNumber()));
          }
        }
      }
    }
    return nullptr;
  }

  /**
   Returns true if this interpolator can interpolate this value type
   */
  static bool isConvertable(const JsiValue &value) {
    if (value.getType() == PropType::HostObject) {
      // Try reading as rect
      auto rectPtr =
          std::dynamic_pointer_cast<JsiSkRRect>(value.getAsHostObject());
      if (rectPtr != nullptr) {
        return true;
      }
    } else {
      if (value.getType() == PropType::Object) {
        if (value.hasValue(PropNameRect) && value.hasValue(PropNameRx) &&
            value.hasValue(PropNameRy)) {
          auto rect = value.getValue(PropNameRect);
          if (rect.hasValue(PropNameX) && rect.hasValue(PropNameY) &&
              rect.hasValue(PropNameWidth) && rect.hasValue(PropNameHeight)) {
            return true;
          }
        }
      }
    }
    return false;
  }
};
} // namespace RNSkia
