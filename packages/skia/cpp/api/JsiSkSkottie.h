#pragma once

#include <jsi/jsi.h>

#include "JsiSkCanvas.h"
#include "JsiSkColor.h"
#include "JsiSkHostObjects.h"
#include "JsiSkPoint.h"
#include "JsiSkRect.h"
#include "third_party/SkottieUtils.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/codec/SkJpegDecoder.h"
#include "include/codec/SkPngDecoder.h"
#include "include/codec/SkWebpDecoder.h"

#include "modules/skottie/include/Skottie.h"
#include "modules/skottie/include/SkottieProperty.h"
#include "modules/skottie/include/SlotManager.h"
#include "modules/sksg/include/SkSGInvalidationController.h"

#pragma clang diagnostic pop

namespace RNSkia {
using namespace facebook;

std::unique_ptr<SkCodec> DecodeImageData(sk_sp<SkData> data) {
  if (data == nullptr) {
    return nullptr;
  }

  if (SkJpegDecoder::IsJpeg(data->data(), data->size())) {
    return SkJpegDecoder::Decode(data, nullptr);
  }

  if (SkPngDecoder::IsPng(data->data(), data->size())) {
    return SkPngDecoder::Decode(data, nullptr);
  }

  if (SkWebpDecoder::IsWebp(data->data(), data->size())) {
    return SkWebpDecoder::Decode(data, nullptr);
  }
  return nullptr;
}

class SkottieAssetProvider : public skottie::ResourceProvider {
public:
  using AssetMap = std::unordered_map<std::string, sk_sp<SkData>>;

  static sk_sp<SkottieAssetProvider> Make(AssetMap assets,
                                          sk_sp<SkFontMgr> fontMgr) {
    return sk_sp<SkottieAssetProvider>(
        new SkottieAssetProvider(std::move(assets), std::move(fontMgr)));
  }

  ~SkottieAssetProvider() override = default;

  sk_sp<skottie::ImageAsset>
  loadImageAsset(const char[] /* path */, const char name[],
                 const char[] /* id */) const override {
    // For CK/Skottie we ignore paths & IDs, and identify images based solely on
    // name.
    if (auto data = this->findAsset(name)) {
      auto codec = DecodeImageData(data);
      if (!codec) {
        return nullptr;
      }
      return skresources::MultiFrameImageAsset::Make(std::move(codec));
    }

    return nullptr;
  }

  sk_sp<skresources::ExternalTrackAsset>
  loadAudioAsset(const char[] /* path */, const char[] /* name */,
                 const char id[]) override {

    return nullptr;
  }

  sk_sp<SkTypeface> loadTypeface(const char name[],
                                 const char[] /* url */) const override {
    RNSkLogger::logToConsole("loadTypeface %s", name);
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
  ManagedAnimation(std::string json, SkottieAssetProvider::AssetMap assets,
                   sk_sp<SkFontMgr> fontMgr) {
    _propManager = std::make_unique<CustomPropertyManager>(
        CustomPropertyManager::Mode::kCollapseProperties, "");
    _resourceProvider =
        SkottieAssetProvider::Make(std::move(assets), std::move(fontMgr));
    // There is a bug in the ref counting that we address here.
    _resourceProvider->ref();
    auto builder = std::make_shared<skottie::Animation::Builder>();
    builder->setResourceProvider(_resourceProvider);
    builder->setPropertyObserver(_propManager->getPropertyObserver());
    _animation = builder->make(json.c_str(), json.size());
    _slotManager = builder->getSlotManager();
  }

  ~ManagedAnimation() {
    _animation = nullptr;
    _slotManager = nullptr;
    // Here the ref count is 0 but it's because of a bug, we need to still
    // delete the resource provider
    if (_resourceProvider) {
      auto *raw_ptr = _resourceProvider.get();
      _resourceProvider = nullptr;
      delete raw_ptr; // Direct delete - bypasses ref counting entirely
    }
  }

public:
  sk_sp<skottie::Animation> _animation = nullptr;
  sk_sp<skottie::SlotManager> _slotManager = nullptr;
  sk_sp<SkottieAssetProvider> _resourceProvider = nullptr;
  std::unique_ptr<CustomPropertyManager> _propManager = nullptr;
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
    return getObject()->_propManager->setColor(key, color);
  }

  JSI_HOST_FUNCTION(setOpacity) {
    if (count < 2) {
      return jsi::Value(false);
    }

    auto key = arguments[0].asString(runtime).utf8(runtime);
    auto opacity = arguments[1].asNumber();
    return getObject()->_propManager->setOpacity(key, opacity);
  }

  JSI_HOST_FUNCTION(setText) {
    if (count < 3) {
      return jsi::Value(false);
    }
    auto key = arguments[0].asString(runtime).utf8(runtime);
    auto text = arguments[1].asString(runtime).utf8(runtime);
    auto size = arguments[2].asNumber();
    // preserve all other text fields
    auto t = getObject()->_propManager->getText(key);
    t.fText = SkString(text);
    t.fTextSize = size;
    return getObject()->_propManager->setText(key, t);
  }

  JSI_HOST_FUNCTION(getTextProps) {
    auto textProps = getObject()->_propManager->getTextProps();
    int i = 0;
    auto props = jsi::Array(runtime, textProps.size());
    for (const auto &prop : textProps) {
      auto txt = getObject()->_propManager->getText(prop);
      auto txtVal = jsi::Object(runtime);
      txtVal.setProperty(runtime, "text", txt.fText.c_str());
      txtVal.setProperty(runtime, "size", txt.fTextSize);
      auto val = jsi::Object(runtime);
      val.setProperty(runtime, "key", prop);
      val.setProperty(runtime, "value", txtVal);
      props.setValueAtIndex(runtime, i, val);
      i++;
    }
    return props;
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
    return getObject()->_propManager->setTransform(key, transform);
  }

  JSI_HOST_FUNCTION(getSlotInfo) {
    jsi::Object slotInfoJS = jsi::Object(runtime);
    auto slotInfo = getObject()->_slotManager->getSlotInfo();

    auto colorSlotIDs = jsi::Array(runtime, slotInfo.fColorSlotIDs.size());
    for (size_t i = 0; i < slotInfo.fColorSlotIDs.size(); i++) {
      colorSlotIDs.setValueAtIndex(
          runtime, i,
          jsi::String::createFromUtf8(runtime,
                                      slotInfo.fColorSlotIDs[i].c_str()));
    }
    slotInfoJS.setProperty(runtime, "colorSlotIDs", colorSlotIDs);

    auto scalarSlotIDs = jsi::Array(runtime, slotInfo.fScalarSlotIDs.size());
    for (size_t i = 0; i < slotInfo.fScalarSlotIDs.size(); i++) {
      scalarSlotIDs.setValueAtIndex(
          runtime, i,
          jsi::String::createFromUtf8(runtime,
                                      slotInfo.fScalarSlotIDs[i].c_str()));
    }
    slotInfoJS.setProperty(runtime, "scalarSlotIDs", scalarSlotIDs);

    auto vec2SlotIDs = jsi::Array(runtime, slotInfo.fVec2SlotIDs.size());
    for (size_t i = 0; i < slotInfo.fVec2SlotIDs.size(); i++) {
      vec2SlotIDs.setValueAtIndex(
          runtime, i,
          jsi::String::createFromUtf8(runtime,
                                      slotInfo.fVec2SlotIDs[i].c_str()));
    }
    slotInfoJS.setProperty(runtime, "vec2SlotIDs", vec2SlotIDs);

    auto imageSlotIDs = jsi::Array(runtime, slotInfo.fImageSlotIDs.size());
    for (size_t i = 0; i < slotInfo.fImageSlotIDs.size(); i++) {
      imageSlotIDs.setValueAtIndex(
          runtime, i,
          jsi::String::createFromUtf8(runtime,
                                      slotInfo.fImageSlotIDs[i].c_str()));
    }
    slotInfoJS.setProperty(runtime, "imageSlotIDs", imageSlotIDs);

    auto textSlotIDs = jsi::Array(runtime, slotInfo.fTextSlotIDs.size());
    for (size_t i = 0; i < slotInfo.fTextSlotIDs.size(); i++) {
      textSlotIDs.setValueAtIndex(
          runtime, i,
          jsi::String::createFromUtf8(runtime,
                                      slotInfo.fTextSlotIDs[i].c_str()));
    }
    slotInfoJS.setProperty(runtime, "textSlotIDs", textSlotIDs);
    return slotInfoJS;
  }

  JSI_HOST_FUNCTION(setColorSlot) {
    if (count < 2) {
      return jsi::Value(false);
    }
    auto slotID = arguments[0].asString(runtime).utf8(runtime);
    auto color = JsiSkColor::fromValue(runtime, arguments[1]);
    return getObject()->_slotManager->setColorSlot(SkString(slotID), color);
  }

  JSI_HOST_FUNCTION(setScalarSlot) {
    if (count < 2) {
      return jsi::Value(false);
    }
    auto slotID = arguments[0].asString(runtime).utf8(runtime);
    auto scalar = arguments[1].asNumber();
    return getObject()->_slotManager->setScalarSlot(SkString(slotID), scalar);
  }

  JSI_HOST_FUNCTION(setVec2Slot) {
    if (count < 2) {
      return jsi::Value(false);
    }
    auto slotID = arguments[0].asString(runtime).utf8(runtime);
    auto point = JsiSkPoint::fromValue(runtime, arguments[1]);
    SkV2 vec2{point->x(), point->y()};
    return getObject()->_slotManager->setVec2Slot(SkString(slotID), vec2);
  }

  JSI_HOST_FUNCTION(setTextSlot) {
    if (count < 2) {
      return jsi::Value(false);
    }
    auto key = arguments[0].asString(runtime).utf8(runtime);
    // TODO: Implement proper text slot setting
    return jsi::Value(false);
  }

  JSI_HOST_FUNCTION(setImageSlot) {
    if (count < 2) {
      return jsi::Value(false);
    }
    auto slotID = arguments[0].asString(runtime).utf8(runtime);
    auto assetName = arguments[1].asString(runtime).utf8(runtime);
    return getObject()->_slotManager->setImageSlot(
        SkString(slotID), getObject()->_resourceProvider->loadImageAsset(
                              nullptr, assetName.data(), nullptr));
  }

  JSI_HOST_FUNCTION(getColorSlot) {
    if (count < 1) {
      return jsi::Value::null();
    }
    auto slotID = arguments[0].asString(runtime).utf8(runtime);
    if (auto v = getObject()->_slotManager->getColorSlot(SkString(slotID))) {
      return JsiSkColor::toValue(runtime, v.value());
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(getScalarSlot) {
    if (count < 1) {
      return jsi::Value::null();
    }
    auto slotID = arguments[0].asString(runtime).utf8(runtime);
    if (auto v = getObject()->_slotManager->getScalarSlot(SkString(slotID))) {
      return jsi::Value(v.value());
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(getVec2Slot) {
    if (count < 1) {
      return jsi::Value::null();
    }
    auto slotID = arguments[0].asString(runtime).utf8(runtime);
    if (auto v = getObject()->_slotManager->getVec2Slot(SkString(slotID))) {
      auto point = jsi::Object(runtime);
      point.setProperty(runtime, "x", static_cast<double>(v->x));
      point.setProperty(runtime, "y", static_cast<double>(v->y));
      return point;
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(getTextSlot) {
    if (count < 1) {
      return jsi::Value::null();
    }
    auto slotID = arguments[0].asString(runtime).utf8(runtime);
    if (auto textProp =
            getObject()->_slotManager->getTextSlot(SkString(slotID))) {
      jsi::Object textVal(runtime);
      // text_val.set("typeface", textProp->fTypeface);
      // text_val.set("text", emscripten::val(textProp->fText.c_str()));
      // text_val.set("textSize", textProp->fTextSize);
      // text_val.set("minTextSize", textProp->fMinTextSize);
      // text_val.set("maxTextSize", textProp->fMaxTextSize);
      // text_val.set("strokeWidth", textProp->fStrokeWidth);
      // text_val.set("lineHeight", textProp->fLineHeight);
      // text_val.set("lineShift", textProp->fLineShift);
      // text_val.set("ascent", textProp->fAscent);
      // text_val.set("maxLines", textProp->fMaxLines);

      // switch (textProp->fHAlign) {
      // case SkTextUtils::Align::kLeft_Align:
      //   text_val.set("horizAlign", para::TextAlign::kLeft);
      //   break;
      // case SkTextUtils::Align::kRight_Align:
      //   text_val.set("horizAlign", para::TextAlign::kRight);
      //   break;
      // case SkTextUtils::Align::kCenter_Align:
      //   text_val.set("horizAlign", para::TextAlign::kCenter);
      //   break;
      // default:
      //   text_val.set("horizAlign", para::TextAlign::kLeft);
      //   break;
      // }

      // text_val.set("vertAlign", textProp->fVAlign);
      // text_val.set("resize", textProp->fResize);

      // if (textProp->fLineBreak ==
      //     skottie::Shaper::LinebreakPolicy::kParagraph) {
      //   text_val.set("linebreak", SkUnicode::LineBreakType::kSoftLineBreak);
      // } else {
      //   text_val.set("linebreak", SkUnicode::LineBreakType::kHardLineBreak);
      // }

      // if (textProp->fDirection == skottie::Shaper::Direction::kLTR) {
      //   text_val.set("direction", para::TextDirection::kLtr);
      // } else {
      //   text_val.set("direction", para::TextDirection::kRtl);
      // }
      // text_val.set("strokeJoin", textProp->fStrokeJoin);

      // text_val.set(
      //     "fillColor",
      //     MakeTypedArray(4,
      //     SkColor4f::FromColor(textProp->fFillColor).vec()));

      // text_val.set("strokeColor",
      //              MakeTypedArray(
      //                  4,
      //                  SkColor4f::FromColor(textProp->fStrokeColor).vec()));

      // const float box[] = {textProp->fBox.fLeft, textProp->fBox.fTop,
      //                      textProp->fBox.fRight, textProp->fBox.fBottom};
      // text_val.set("boundingBox", MakeTypedArray(4, box));
      return textVal;
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(getColorProps) {
    auto props = getObject()->_propManager->getColorProps();
    auto colorProps =
        jsi::Array(runtime, getObject()->_propManager->getColorProps().size());
    int i = 0;
    for (const auto &cp : getObject()->_propManager->getColorProps()) {
      auto colorProp = jsi::Object(runtime);
      colorProp.setProperty(runtime, "key", cp);
      auto colorPropValue = getObject()->_propManager->getColor(cp);
      colorProp.setProperty(runtime, "value",
                            JsiSkColor::toValue(runtime, colorPropValue));
      colorProps.setValueAtIndex(runtime, i, colorProp);
      i++;
    }

    return colorProps;
  }

  JSI_HOST_FUNCTION(getOpacityProps) {
    auto props = getObject()->_propManager->getOpacityProps();
    auto opacityProps = jsi::Array(
        runtime, getObject()->_propManager->getOpacityProps().size());
    int i = 0;
    for (const auto &op : getObject()->_propManager->getOpacityProps()) {
      auto opacityProp = jsi::Object(runtime);
      opacityProp.setProperty(runtime, "key", op);
      opacityProp.setProperty(runtime, "value",
                              getObject()->_propManager->getOpacity(op));
      opacityProps.setValueAtIndex(runtime, i, opacityProp);
      i++;
    }
    return opacityProps;
  }

  JSI_HOST_FUNCTION(getTransformProps) {
    auto props = getObject()->_propManager->getTransformProps();
    auto transformProps = jsi::Array(
        runtime, getObject()->_propManager->getTransformProps().size());
    int i = 0;
    for (const auto &tp : getObject()->_propManager->getTransformProps()) {
      const auto transform = getObject()->_propManager->getTransform(tp);

      auto transformProp = jsi::Object(runtime);
      transformProp.setProperty(runtime, "key", tp);
      jsi::Object transformPropValue(runtime);
      auto anchor = jsi::Object(runtime);

      anchor.setProperty(runtime, "x", transform.fAnchorPoint.x());
      anchor.setProperty(runtime, "y", transform.fAnchorPoint.y());
      transformPropValue.setProperty(runtime, "anchor", anchor);

      auto position = jsi::Object(runtime);
      position.setProperty(runtime, "x", transform.fPosition.x());
      position.setProperty(runtime, "y", transform.fPosition.y());
      transformPropValue.setProperty(runtime, "position", position);

      auto scale = jsi::Object(runtime);
      scale.setProperty(runtime, "x", transform.fScale.x());
      scale.setProperty(runtime, "y", transform.fScale.y());
      transformPropValue.setProperty(runtime, "scale", scale);

      transformPropValue.setProperty(runtime, "rotation", transform.fRotation);
      transformPropValue.setProperty(runtime, "skew", transform.fSkew);
      transformPropValue.setProperty(runtime, "skewAxis", transform.fSkewAxis);
      transformProp.setProperty(runtime, "value", transformPropValue);
      transformProps.setValueAtIndex(runtime, i, transformProp);
      i++;
    }
    return transformProps;
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkSkottie, duration),
                       JSI_EXPORT_FUNC(JsiSkSkottie, fps),
                       JSI_EXPORT_FUNC(JsiSkSkottie, seekFrame),
                       JSI_EXPORT_FUNC(JsiSkSkottie, render),
                       JSI_EXPORT_FUNC(JsiSkSkottie, size),
                       JSI_EXPORT_FUNC(JsiSkSkottie, version),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getSlotInfo),
                       JSI_EXPORT_FUNC(JsiSkSkottie, setColorSlot),
                       JSI_EXPORT_FUNC(JsiSkSkottie, setScalarSlot),
                       JSI_EXPORT_FUNC(JsiSkSkottie, setVec2Slot),
                       JSI_EXPORT_FUNC(JsiSkSkottie, setTextSlot),
                       JSI_EXPORT_FUNC(JsiSkSkottie, setImageSlot),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getColorSlot),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getScalarSlot),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getVec2Slot),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getTextSlot),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getColorProps),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getOpacityProps),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getTransformProps),
                       JSI_EXPORT_FUNC(JsiSkSkottie, getTextProps),
                       JSI_EXPORT_FUNC(JsiSkSkottie, setColor),
                       JSI_EXPORT_FUNC(JsiSkSkottie, setText),
                       JSI_EXPORT_FUNC(JsiSkSkottie, dispose))
  // #endregion

  /**
    Constructor
  */
  JsiSkSkottie(std::shared_ptr<RNSkPlatformContext> context,
               std::shared_ptr<ManagedAnimation> animation)
      : JsiSkWrappingSharedPtrHostObject<ManagedAnimation>(
            std::move(context), std::move(animation)) {}

  size_t getMemoryPressure() const override {
    auto animation = getObject();
    if (!animation || !animation->_animation) {
      return 1024; // Base size if no animation
    }

    auto size = animation->_animation->size();
    auto duration = animation->_animation->duration();
    auto fps = animation->_animation->fps();

    // Estimate memory usage based on animation properties
    // Base calculation: width * height * 4 bytes per pixel * estimated frame
    // count
    size_t frameCount = static_cast<size_t>(duration * fps);
    size_t estimatedFrameSize =
        static_cast<size_t>(size.width() * size.height() * 4);

    // Conservative estimate: assume some frames are cached
    size_t cachedFrames =
        std::min(frameCount, static_cast<size_t>(60)); // Max 60 cached frames
    size_t animationMemory = estimatedFrameSize * cachedFrames;

    // Add base overhead for animation data structures
    size_t baseOverhead =
        64 * 1024; // 64KB for metadata, property managers, etc.

    return animationMemory + baseOverhead;
  }
};
} // namespace RNSkia
