#pragma once

#include <jsi/jsi.h>

#include "JsiSkCanvas.h"
#include "JsiSkColor.h"
#include "JsiSkHostObjects.h"
#include "JsiSkPoint.h"
#include "JsiSkRect.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "modules/skottie/include/Skottie.h"
#include "modules/skottie/include/SkottieProperty.h"
#include "modules/skottie/include/SlotManager.h"
#include "third_party/SkottieUtils.h"
#include "modules/sksg/include/SkSGInvalidationController.h"

#pragma clang diagnostic pop

namespace RNSkia {
using namespace facebook;

class JsiSkSkottie : public JsiSkWrappingSkPtrHostObject<skottie::Animation> {
public:
  // #region Properties
  JSI_HOST_FUNCTION(duration) {
    return static_cast<double>(getObject()->duration());
  }
  JSI_HOST_FUNCTION(fps) { return static_cast<double>(getObject()->fps()); }

  JSI_PROPERTY_GET(__typename__) {
    return jsi::String::createFromUtf8(runtime, "Skottie");
  }

  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiSkSkottie, __typename__))
  // #endregion

  // #region Methods
  JSI_HOST_FUNCTION(seekFrame) {
    sksg::InvalidationController ic;
    getObject()->seekFrame(arguments[0].asNumber(), &ic);
    auto bounds = ic.bounds();
    if (count >= 2) {
      auto rect = JsiSkRect::fromValue(runtime, arguments[1]);
      if (rect != nullptr) {
        rect->setXYWH(bounds.x(), bounds.y(), bounds.width(), bounds.height());
      }
    }
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(size) {
    auto size = getObject()->size();
    jsi::Object jsiSize(runtime);
    jsiSize.setProperty(runtime, "width", size.width());
    jsiSize.setProperty(runtime, "height", size.height());
    return jsiSize;
  }

  JSI_HOST_FUNCTION(render) {
    auto canvas = arguments[0]
                      .asObject(runtime)
                      .asHostObject<JsiSkCanvas>(runtime)
                      ->getCanvas();
    if (count > 1) {
      auto rect = JsiSkRect::fromValue(runtime, arguments[1]);
      getObject()->render(canvas, rect.get());
    } else {
      getObject()->render(canvas);
    }

    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(version) {
    return jsi::String::createFromUtf8(runtime, getObject()->version().c_str());
  }

  JSI_HOST_FUNCTION(setColor) {
    if (count < 2) {
      return jsi::Value(false);
    }
    
    auto key = arguments[0].asString(runtime).utf8(runtime);
    auto color = JsiSkColor::fromValue(runtime, arguments[1]);
    return _propMgr->setColor(key, color);
  }

  JSI_HOST_FUNCTION(setOpacity) {
    if (count < 2) {
      return jsi::Value(false);
    }
    
    auto key = arguments[0].asString(runtime).utf8(runtime);
    auto opacity = arguments[1].asNumber();
    return _propMgr->setOpacity(key, opacity);
  }

  JSI_HOST_FUNCTION(setText) {
    if (count < 3) {
      return jsi::Value(false);
    }
    
    SkString key(arguments[0].asString(runtime).utf8(runtime));
    SkString text(arguments[1].asString(runtime).utf8(runtime));
    auto size = arguments[2].asNumber();
    return false;
  }

  JSI_HOST_FUNCTION(setTransform) {
    if (count < 7) {
      return jsi::Value(false);
    }
    
    auto key = arguments[0].asString(runtime).utf8(runtime);
    auto anchor = JsiSkPoint::fromValue(runtime, arguments[1]);
    auto position = JsiSkPoint::fromValue(runtime, arguments[2]);
    auto scale = JsiSkPoint::fromValue(runtime, arguments[3]);
    auto rotation = arguments[4].asNumber();
    auto skew = arguments[5].asNumber();
    auto skewAxis = arguments[6].asNumber();
      
    skottie::TransformPropertyValue transform;
    transform.fAnchorPoint = {anchor->x(), anchor->y()};
    transform.fPosition = {position->x(), position->y()};
    transform.fScale = {scale->x(), scale->y()};
    transform.fRotation = rotation;
    transform.fSkew = skew;
    transform.fSkewAxis = skewAxis;
    return _propMgr->setTransform(key, transform);
  }

  JSI_HOST_FUNCTION(getMarkers) {
    jsi::Array markersArray = jsi::Array(runtime, 0);
    return markersArray;
  }

  JSI_HOST_FUNCTION(getColorProps) {
    auto colorProps = _propMgr->getColorProps();
    jsi::Array propsArray = jsi::Array(runtime, colorProps.size());
    int i = 0;
    for (const auto& cp : colorProps) {
      auto prop = jsi::Object(runtime);
      prop.setProperty(runtime, "key", cp);
      auto color = _propMgr->getColor(cp);
      prop.setProperty(runtime, "value", JsiSkColor::toValue(runtime, color));
      propsArray.setValueAtIndex(runtime, i, prop);
      i++;
    }
    return propsArray;
  }

  JSI_HOST_FUNCTION(getOpacityProps) {
    jsi::Array propsArray = jsi::Array(runtime, 0);
    return propsArray;
  }

  JSI_HOST_FUNCTION(getTextProps) {
    jsi::Array propsArray = jsi::Array(runtime, 0);
    return propsArray;
  }

  JSI_HOST_FUNCTION(getTransformProps) {
    jsi::Array propsArray = jsi::Array(runtime, 0);
    return propsArray;
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkSkottie, duration),
                       JSI_EXPORT_FUNC(JsiSkSkottie, fps),
                       JSI_EXPORT_FUNC(JsiSkSkottie, seekFrame),
                       JSI_EXPORT_FUNC(JsiSkSkottie, render),
                       JSI_EXPORT_FUNC(JsiSkSkottie, size),
                       JSI_EXPORT_FUNC(JsiSkSkottie, version),
                       JSI_EXPORT_FUNC(JsiSkSkottie, setColor),
                       JSI_EXPORT_FUNC(JsiSkSkottie, setOpacity),
                       JSI_EXPORT_FUNC(JsiSkSkottie, setText),
                       JSI_EXPORT_FUNC(JsiSkSkottie, setTransform),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getMarkers),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getColorProps),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getOpacityProps),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getTextProps),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getTransformProps),
                       JSI_EXPORT_FUNC(JsiSkSkottie, dispose))
  // #endregion

  /**
    Constructor
  */
  JsiSkSkottie(std::shared_ptr<RNSkPlatformContext> context,
               sk_sp<skottie::Animation> animation,
               std::unique_ptr<skottie_utils::CustomPropertyManager> propMgr,
               sk_sp<skottie::SlotManager> slotMgr,
               sk_sp<skresources::ResourceProvider> rp)
      : JsiSkWrappingSkPtrHostObject<skottie::Animation>(std::move(context),
                                                         std::move(animation)),
    _propMgr(std::move(propMgr)), _slotMgr(std::move(slotMgr)) {
  }
private:
    std::unique_ptr<skottie_utils::CustomPropertyManager> _propMgr;
    sk_sp<skottie::SlotManager> _slotMgr;
};
} // namespace RNSkia
