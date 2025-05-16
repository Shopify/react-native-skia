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
#include "modules/sksg/include/SkSGInvalidationController.h"

#pragma clang diagnostic pop

namespace RNSkia {
using namespace facebook;


class SkottieAssetProvider : public skottie::ResourceProvider {
public:
    ~SkottieAssetProvider() override {
        RNSkLogger::logToConsole("hello!");
    }
   
    using AssetMap = std::unordered_map<std::string, sk_sp<SkData>>;

    static sk_sp<SkottieAssetProvider> Make(AssetMap assets,
                                            sk_sp<SkFontMgr> fontMgr) {
        return sk_sp<SkottieAssetProvider>(
                                           new SkottieAssetProvider(std::move(assets), std::move(fontMgr)));
    }
   
   sk_sp<skottie::ImageAsset>
   loadImageAsset(const char[] /* path */, const char name[],
                  const char[] /* id */) const override {
       // For CK/Skottie we ignore paths & IDs, and identify images based solely on
       // name.
       //    if (auto data = this->findAsset(name)) {
       //      auto codec = DecodeImageData(data);
       //      if (!codec) {
       //        return nullptr;
       //      }
       //      return skresources::MultiFrameImageAsset::Make(std::move(codec));
       //    }
       
       return nullptr;
   }
   
   sk_sp<skresources::ExternalTrackAsset>
   loadAudioAsset(const char[] /* path */, const char[] /* name */,
                  const char id[]) override {
       
       return nullptr;
   }
   
   sk_sp<SkTypeface> loadTypeface(const char name[],
                                  const char[] /* url */) const override {
       sk_sp<SkData> faceData = this->findAsset(name);
       if (!faceData) {
           return nullptr;
       }
       return fFontMgr->makeFromData(std::move(faceData));
   }
   
   sk_sp<SkData> load(const char[] /*path*/, const char name[]) const override {
       // Ignore paths.
       return this->findAsset(name);
   }
    
private:
    explicit SkottieAssetProvider(AssetMap assets, sk_sp<SkFontMgr> fontMgr)
     : fAssets(std::move(assets)), fFontMgr(std::move(fontMgr)) {}
  const AssetMap fAssets;
  const sk_sp<SkFontMgr> fFontMgr;

 sk_sp<SkData> findAsset(const char name[]) const {
   auto it = fAssets.find(name);
   if (it != fAssets.end()) {
     return it->second;
   }
   return nullptr;
 }
};

class ManagedAnimation {
public:
  ManagedAnimation(std::string json,
                   SkottieAssetProvider::AssetMap assets,
                   sk_sp<SkFontMgr> fontMgr)  {
    _rp = SkottieAssetProvider::Make(std::move(assets), std::move(fontMgr));
    _rp->ref();
    skottie::Animation::Builder builder;
    builder.setResourceProvider(_rp);
    _animation = builder.make(json.c_str(), json.size());
  }
    
//    ~ManagedAnimation() {
//       // _rp->unref();
//        _animation = nullptr;
//        //_rp->unref();
//        //_rp = nullptr;
//    }

public:
  sk_sp<skottie::Animation> _animation = nullptr;
  sk_sp<skottie::ResourceProvider> _rp = nullptr;
};

class JsiSkSkottie : public JsiSkWrappingSharedPtrHostObject<ManagedAnimation> {
public:
  // #region Properties
  JSI_HOST_FUNCTION(duration) {
    return static_cast<double>(getObject()->_animation->duration());
  }
  JSI_HOST_FUNCTION(fps) {
    return static_cast<double>(getObject()->_animation->fps());
  }

  JSI_PROPERTY_GET(__typename__) {
    return jsi::String::createFromUtf8(runtime, "Skottie");
  }

  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiSkSkottie, __typename__))
  // #endregion

  // #region Methods
  JSI_HOST_FUNCTION(seekFrame) {
    sksg::InvalidationController ic;
    getObject()->_animation->seekFrame(arguments[0].asNumber(), &ic);
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
    auto size = getObject()->_animation->size();
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
      getObject()->_animation->render(canvas, rect.get());
    } else {
      getObject()->_animation->render(canvas);
    }

    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(version) {
    return jsi::String::createFromUtf8(
        runtime, getObject()->_animation->version().c_str());
  }

  JSI_HOST_FUNCTION(setColor) {
    if (count < 2) {
      return jsi::Value(false);
    }

    auto key = arguments[0].asString(runtime).utf8(runtime);
    auto color = JsiSkColor::fromValue(runtime, arguments[1]);
    // return getObject()->_propMgr->setColor(key, color);
    return false;
  }

  JSI_HOST_FUNCTION(setOpacity) {
    if (count < 2) {
      return jsi::Value(false);
    }

    auto key = arguments[0].asString(runtime).utf8(runtime);
    auto opacity = arguments[1].asNumber();
    // return getObject()->_propMgr->setOpacity(key, opacity);
    return false;
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
    // return getObject()->_propMgr->setTransform(key, transform);
    return false;
  }

  JSI_HOST_FUNCTION(getMarkers) {
    jsi::Array markersArray = jsi::Array(runtime, 0);
    return markersArray;
  }

  JSI_HOST_FUNCTION(getColorProps) {
    jsi::Array propsArray = jsi::Array(runtime, 0);
    return propsArray;
    //   auto colorProps = getObject()->_propertyObserver->getColorMap();
    //   jsi::Array propsArray = jsi::Array(runtime, colorProps.size());
    //
    //   size_t i = 0;
    //   for (const auto& pair : colorProps) {
    //     jsi::Object propObj(runtime);
    //     propObj.setProperty(runtime, "key",
    //     jsi::String::createFromUtf8(runtime, pair.first));
    //     propObj.setProperty(runtime, "value", JsiSkColor::toValue(runtime,
    //     pair.second)); propsArray.setValueAtIndex(runtime, i++, propObj);
    //   }
    //
    //   return propsArray;
  }

  //   JSI_HOST_FUNCTION(getOpacityProps) {
  //     auto opacityProps = getObject()->_propertyObserver->getOpacityMap();
  //     jsi::Array propsArray = jsi::Array(runtime, opacityProps.size());

  //     size_t i = 0;
  //     for (const auto& pair : opacityProps) {
  //       jsi::Object propObj(runtime);
  //       propObj.setProperty(runtime, "key",
  //       jsi::String::createFromUtf8(runtime, pair.first));
  //       propObj.setProperty(runtime, "value", jsi::Value(pair.second));
  //       propsArray.setValueAtIndex(runtime, i++, propObj);
  //     }

  //     return propsArray;
  //   }

  //   JSI_HOST_FUNCTION(getTextProps) {
  //     auto textProps = getObject()->_propertyObserver->getTextMap();
  //     jsi::Array propsArray = jsi::Array(runtime, textProps.size());

  //     size_t i = 0;
  //     for (const auto& pair : textProps) {
  //       jsi::Object propObj(runtime);
  //       propObj.setProperty(runtime, "key",
  //       jsi::String::createFromUtf8(runtime, pair.first));

  //       // Create a text property value object
  //       jsi::Object textValue(runtime);
  //       textValue.setProperty(runtime, "text",
  //       jsi::String::createFromUtf8(runtime, pair.second.fText.c_str()));

  //       // Add other text properties as needed
  //       if (!pair.second.fFontFamily.isEmpty()) {
  //         textValue.setProperty(runtime, "fontFamily",
  //           jsi::String::createFromUtf8(runtime,
  //           pair.second.fFontFamily.c_str()));
  //       }

  //       propObj.setProperty(runtime, "value", textValue);
  //       propsArray.setValueAtIndex(runtime, i++, propObj);
  //     }

  //     return propsArray;
  //   }

  //   JSI_HOST_FUNCTION(getTransformProps) {
  //     auto transformProps =
  //     getObject()->_propertyObserver->getTransformMap(); jsi::Array
  //     propsArray = jsi::Array(runtime, transformProps.size());

  //     size_t i = 0;
  //     for (const auto& pair : transformProps) {
  //       jsi::Object propObj(runtime);
  //       propObj.setProperty(runtime, "key",
  //       jsi::String::createFromUtf8(runtime, pair.first));

  //       // Create a transform property value object
  //       jsi::Object transformValue(runtime);

  // //      // Convert anchor point
  // //      auto anchor = JsiSkPoint::createFromPoint(runtime,
  // pair.second.fAnchorPoint);
  // //      transformValue.setProperty(runtime, "anchorPoint",
  // jsi::Object::createFromHostObject(runtime, anchor));
  // //
  // //      // Convert position
  // //      auto position = JsiSkPoint::createFromPoint(runtime,
  // pair.second.fPosition);
  // //      transformValue.setProperty(runtime, "position",
  // jsi::Object::createFromHostObject(runtime, position));
  // //
  // //      // Convert scale
  // //      auto scale = JsiSkPoint::createFromPoint(runtime,
  // {pair.second.fScale.x(), pair.second.fScale.y()});
  // //      transformValue.setProperty(runtime, "scale",
  // jsi::Object::createFromHostObject(runtime, scale));

  //       // Convert rotation, skew, skewAxis
  //       transformValue.setProperty(runtime, "rotation",
  //       jsi::Value(pair.second.fRotation));
  //       transformValue.setProperty(runtime, "skew",
  //       jsi::Value(pair.second.fSkew)); transformValue.setProperty(runtime,
  //       "skewAxis", jsi::Value(pair.second.fSkewAxis));

  //       propObj.setProperty(runtime, "value", transformValue);
  //       propsArray.setValueAtIndex(runtime, i++, propObj);
  //     }

  //     return propsArray;
  //   }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkSkottie, duration),
                       JSI_EXPORT_FUNC(JsiSkSkottie, fps),
                       JSI_EXPORT_FUNC(JsiSkSkottie, seekFrame),
                       JSI_EXPORT_FUNC(JsiSkSkottie, render),
                       JSI_EXPORT_FUNC(JsiSkSkottie, size),
                       JSI_EXPORT_FUNC(JsiSkSkottie, version),
                       JSI_EXPORT_FUNC(JsiSkSkottie, setColor),
                       // JSI_EXPORT_FUNC(JsiSkSkottie, setOpacity),
                       // JSI_EXPORT_FUNC(JsiSkSkottie, setText),
                       // JSI_EXPORT_FUNC(JsiSkSkottie, setTransform),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getMarkers),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getColorProps),
                       // JSI_EXPORT_FUNC(JsiSkSkottie, getOpacityProps),
                       // JSI_EXPORT_FUNC(JsiSkSkottie, getTextProps),
                       // JSI_EXPORT_FUNC(JsiSkSkottie, getTransformProps),
                       JSI_EXPORT_FUNC(JsiSkSkottie, dispose))
  // #endregion

  /**
    Constructor
  */
  JsiSkSkottie(std::shared_ptr<RNSkPlatformContext> context,
               std::shared_ptr<ManagedAnimation> animation)
      : JsiSkWrappingSharedPtrHostObject<ManagedAnimation>(
            std::move(context), std::move(animation)) {}
};
} // namespace RNSkia
