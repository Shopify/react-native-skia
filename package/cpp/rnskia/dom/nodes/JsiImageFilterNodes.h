#pragma once

#include "JsiColorFilterNodes.h"
#include "JsiDomDeclarationNode.h"
#include "JsiShaderNodes.h"
#include "JsiSkRuntimeEffect.h"

#include "NodeProp.h"
#include "RadiusProp.h"
#include "TileModeProp.h"
#include "UniformsProp.h"

#include <memory>
#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkImageFilter.h>

#pragma clang diagnostic pop

namespace RNSkia {

class JsiBaseImageFilterNode : public JsiDomDeclarationNode {
public:
  JsiBaseImageFilterNode(std::shared_ptr<RNSkPlatformContext> context,
                         const char *type)
      : JsiDomDeclarationNode(context, type, DeclarationType::ImageFilter) {}

protected:
  void composeAndPush(sk_sp<SkImageFilter> imgf1) {
    auto imgf2 = getChildDeclarationContext()->getImageFilters()->popAsOne();
    auto cf = getChildDeclarationContext()->getColorFilters()->popAsOne();
    if (cf != nullptr) {
      imgf2 = SkImageFilters::Compose(imgf2,
                                      SkImageFilters::ColorFilter(cf, nullptr));
    }
    auto imgf =
        imgf2 != nullptr ? SkImageFilters::Compose(imgf1, imgf2) : imgf1;

    getDeclarationContext()->getImageFilters()->push(imgf);
  }
};

class JsiBlendImageFilterNode : public JsiBaseImageFilterNode,
                                public JsiDomNodeCtor<JsiBlendImageFilterNode> {
public:
  explicit JsiBlendImageFilterNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiBaseImageFilterNode(context, "skBlendImageFilter") {}

protected:
  void decorate(DrawingContext *context) override {

    if (isChanged(context)) {

      if (getChildren().size() != 2) {
        throw std::runtime_error("Blend image filter needs two child nodes.");
      }

      auto background = getChildDeclarationContext()->getImageFilters()->pop();
      auto foreground = getChildDeclarationContext()->getImageFilters()->pop();

      SkBlendMode blendMode = *_blendModeProp->getDerivedValue();
      composeAndPush(SkImageFilters::Blend(blendMode, background, foreground));
    }
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDeclarationNode::defineProperties(container);
    _blendModeProp = container->defineProperty<BlendModeProp>("mode");
    _blendModeProp->require();
  }

private:
  BlendModeProp *_blendModeProp;
};

class JsiDropShadowImageFilterNode
    : public JsiBaseImageFilterNode,
      public JsiDomNodeCtor<JsiDropShadowImageFilterNode> {
public:
  explicit JsiDropShadowImageFilterNode(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiBaseImageFilterNode(context, "skDropShadowImageFilter") {}

protected:
  void decorate(DrawingContext *context) override {
    if (isChanged(context)) {
      auto color = _colorProp->getDerivedValue();
      auto dx = _dxProp->value().getAsNumber();
      auto dy = _dxProp->value().getAsNumber();
      auto blur = _blurProp->value().getAsNumber();
      auto input = getChildDeclarationContext()->getImageFilters()->pop();

      auto inner = _innerProp->isSet() && _innerProp->value().getAsBool();
      auto shadowOnly =
          _shadowOnlyProp->isSet() && _shadowOnlyProp->value().getAsBool();

      if (inner) {
        auto srcGraphic = SkImageFilters::ColorFilter(
            SkColorFilters::Blend(SK_ColorBLACK, SkBlendMode::kDst), nullptr);
        auto srcAlpha = SkImageFilters::ColorFilter(
            SkColorFilters::Blend(SK_ColorBLACK, SkBlendMode::kSrcIn), nullptr);
        auto f1 = SkImageFilters::ColorFilter(
            SkColorFilters::Blend(*color, SkBlendMode::kSrcOut), nullptr);
        auto f2 = SkImageFilters::Offset(dx, dy, f1);
        auto f3 = SkImageFilters::Blur(blur, blur, SkTileMode::kDecal, f2);
        auto f4 = SkImageFilters::Blend(SkBlendMode::kSrcIn, srcAlpha, f3);

        composeAndPush(SkImageFilters::Compose(
            input ? input : nullptr,
            SkImageFilters::Blend(SkBlendMode::kSrcOver, srcGraphic, f4)));

      } else {
        composeAndPush(
            shadowOnly
                ? SkImageFilters::DropShadowOnly(dx, dy, blur, blur, *color,
                                                 input ? input : nullptr)
                : SkImageFilters::DropShadow(dx, dy, blur, blur, *color,
                                             input ? input : nullptr));
      }
    }
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDeclarationNode::defineProperties(container);
    _dxProp = container->defineProperty<NodeProp>("dx");
    _dyProp = container->defineProperty<NodeProp>("dy");
    _blurProp = container->defineProperty<NodeProp>("blur");
    _colorProp = container->defineProperty<ColorProp>("color");

    _innerProp = container->defineProperty<NodeProp>("inner");
    _shadowOnlyProp = container->defineProperty<NodeProp>("shadowOnly");

    _dxProp->require();
    _dyProp->require();
    _blurProp->require();
    _colorProp->require();
  }

private:
  NodeProp *_dxProp;
  NodeProp *_dyProp;
  NodeProp *_blurProp;
  ColorProp *_colorProp;
  NodeProp *_innerProp;
  NodeProp *_shadowOnlyProp;
};

class JsiDisplacementMapImageFilterNode
    : public JsiBaseImageFilterNode,
      public JsiDomNodeCtor<JsiDisplacementMapImageFilterNode> {
public:
  explicit JsiDisplacementMapImageFilterNode(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiBaseImageFilterNode(context, "skDisplacementMapImageFilter") {}

protected:
  void decorate(DrawingContext *context) override {
    if (isChanged(context)) {

      auto channelX =
          getColorChannelFromStringValue(_channelXProp->value().getAsString());
      auto channelY =
          getColorChannelFromStringValue(_channelYProp->value().getAsString());
      auto scale = _scaleProp->value().getAsNumber();

      auto displacement =
          getChildDeclarationContext()->getImageFilters()->pop();

      auto color = getChildDeclarationContext()->getImageFilters()->pop();

      composeAndPush(SkImageFilters::DisplacementMap(
          channelX, channelY, scale, displacement, color ? color : nullptr));
    }
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDeclarationNode::defineProperties(container);
    _channelXProp = container->defineProperty<NodeProp>("channelX");
    _channelYProp = container->defineProperty<NodeProp>("channelY");
    _scaleProp = container->defineProperty<NodeProp>("scale");

    _channelXProp->require();
    _channelYProp->require();
    _scaleProp->require();
  }

private:
  SkColorChannel getColorChannelFromStringValue(const std::string &value) {
    if (value == "r") {
      return SkColorChannel::kR;
    } else if (value == "g") {
      return SkColorChannel::kG;
    } else if (value == "b") {
      return SkColorChannel::kB;
    } else if (value == "a") {
      return SkColorChannel::kA;
    }
    throw std::runtime_error("Value \"" + value +
                             "\" is not a valid color channel.");
  }

  NodeProp *_channelXProp;
  NodeProp *_channelYProp;
  NodeProp *_scaleProp;
};

class JsiBlurImageFilterNode : public JsiBaseImageFilterNode,
                               public JsiDomNodeCtor<JsiBlurImageFilterNode> {
public:
  explicit JsiBlurImageFilterNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiBaseImageFilterNode(context, "skBlurImageFilter") {}

protected:
  void decorate(DrawingContext *context) override {
    if (isChanged(context)) {
      auto input = getChildDeclarationContext()->getImageFilters()->pop();
      composeAndPush(SkImageFilters::Blur(
          _blurProp->getDerivedValue()->x(), _blurProp->getDerivedValue()->y(),
          _tileModeProp->isSet() ? *_tileModeProp->getDerivedValue()
                                 : SkTileMode::kDecal,
          input));
    }
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDeclarationNode::defineProperties(container);
    _blurProp = container->defineProperty<RadiusProp>("blur");
    _tileModeProp = container->defineProperty<TileModeProp>("mode");

    _blurProp->require();
  }

private:
  RadiusProp *_blurProp;
  TileModeProp *_tileModeProp;
};

class JsiOffsetImageFilterNode
    : public JsiBaseImageFilterNode,
      public JsiDomNodeCtor<JsiOffsetImageFilterNode> {
public:
  explicit JsiOffsetImageFilterNode(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiBaseImageFilterNode(context, "skOffsetImageFilter") {}

protected:
  void decorate(DrawingContext *context) override {
    if (isChanged(context)) {
      auto input = getChildDeclarationContext()->getImageFilters()->pop();
      if (getPropsContainer()->isChanged()) {
        composeAndPush(SkImageFilters::Offset(_xProp->value().getAsNumber(),
                                              _yProp->value().getAsNumber(),
                                              input ? input : nullptr));
      }
    }
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDeclarationNode::defineProperties(container);
    _xProp = container->defineProperty<NodeProp>("x");
    _yProp = container->defineProperty<NodeProp>("y");

    _xProp->require();
    _yProp->require();
  }

private:
  NodeProp *_xProp;
  NodeProp *_yProp;
};

class JsiMorphologyImageFilterNode
    : public JsiBaseImageFilterNode,
      public JsiDomNodeCtor<JsiMorphologyImageFilterNode> {
public:
  enum Type { Dilate, Erode };

  explicit JsiMorphologyImageFilterNode(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiBaseImageFilterNode(context, "skMorphologyImageFilter") {}

protected:
  void decorate(DrawingContext *context) override {
    if (isChanged(context)) {
      auto op = getTypeFromStringValue(_operatorProp->value().getAsString());
      auto radius = _radiusProp->getDerivedValue();
      auto input = getChildDeclarationContext()->getImageFilters()->pop();

      if (op == Type::Dilate) {
        composeAndPush(SkImageFilters::Dilate(radius->x(), radius->y(),
                                              input ? input : nullptr));
      } else {
        composeAndPush(SkImageFilters::Erode(radius->x(), radius->y(),
                                             input ? input : nullptr));
      }
    }
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDeclarationNode::defineProperties(container);
    _operatorProp = container->defineProperty<NodeProp>("operator");
    _radiusProp = container->defineProperty<RadiusProp>("radius");

    _operatorProp->require();
    _radiusProp->require();
  }

private:
  Type getTypeFromStringValue(const std::string &value) {
    if (value == "erode") {
      return Type::Erode;
    } else if (value == "dilate") {
      return Type::Dilate;
    }
    throw std::runtime_error("Value \"" + value +
                             "\" is not valid for the operator property in the "
                             "MorphologyImageFilter component.");
  }
  NodeProp *_operatorProp;
  RadiusProp *_radiusProp;
};

class JsiRuntimeShaderImageFilterNode
    : public JsiBaseImageFilterNode,
      public JsiDomNodeCtor<JsiRuntimeShaderImageFilterNode> {
public:
  explicit JsiRuntimeShaderImageFilterNode(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiBaseImageFilterNode(context, "skRuntimeShaderImageFilter") {}

protected:
  void decorate(DrawingContext *context) override {
    if (isChanged(context)) {
      auto source = _sourceProp->value().getAs<JsiSkRuntimeEffect>();
      if (source == nullptr) {
        throw std::runtime_error("Expected runtime effect when reading source "
                                 "property of RuntimeEffectImageFilter.");
      }

      auto builder = SkRuntimeShaderBuilder(source->getObject());
      auto input = getChildDeclarationContext()->getImageFilters()->pop();
      _uniformsProp->processUniforms(builder);

      composeAndPush(SkImageFilters::RuntimeShader(builder, "", input));
    }
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDeclarationNode::defineProperties(container);
    _sourceProp = container->defineProperty<NodeProp>("source");
    _uniformsProp =
        container->defineProperty<UniformsProp>("uniforms", _sourceProp);

    _sourceProp->require();
  }

private:
  NodeProp *_sourceProp;
  UniformsProp *_uniformsProp;
};

} // namespace RNSkia
