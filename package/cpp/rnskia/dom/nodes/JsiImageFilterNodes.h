#pragma once

#include "JsiDomDeclarationNode.h"
#include "JsiSkRuntimeEffect.h"

#include "NodeProp.h"
#include "RadiusProp.h"
#include "UniformsProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkImageFilter.h>

#pragma clang diagnostic pop

namespace RNSkia {

class JsiBaseImageFilterNode:
public JsiDomDeclarationNode<JsiBaseImageFilterNode, sk_sp<SkImageFilter>> {
public:
  JsiBaseImageFilterNode(std::shared_ptr<RNSkPlatformContext> context,
                        const char* type) :
  JsiDomDeclarationNode<JsiBaseImageFilterNode, sk_sp<SkImageFilter>>(context, type) {}
  
  sk_sp<SkImageFilter> getImageFilter() { return getCurrent(); }
  
protected:
  
  void setImageFilter(DrawingContext* context, sk_sp<SkImageFilter> f) {
    set(context, f);
  }
  
  void set(DrawingContext* context, sk_sp<SkImageFilter> imageFilter) override {
    auto paint = context->getMutablePaint();
    if (paint->getImageFilter() != nullptr && paint->getImageFilter() != getCurrent().get()) {
      paint->setImageFilter(SkImageFilters::Compose(paint->refImageFilter(), imageFilter));
    } else {
      paint->setImageFilter(imageFilter);
    }
    
    setCurrent(imageFilter);
  }
};

class JsiBlendImageFilterNode : public JsiBaseImageFilterNode,
public JsiDomNodeCtor<JsiBlendImageFilterNode> {
public:
  JsiBlendImageFilterNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseImageFilterNode(context, "skBlendImageFilter") {}
    
protected:
  
  void materialize(DrawingContext* context) override {
    
    if (isChanged(context)) {
      
      if (getChildren().size() != 2) {
        throw std::runtime_error("Blend image filter needs two child nodes.");
      }
      
      auto background = requireChild(0)->getImageFilter();
      auto foreground = requireChild(1)->getImageFilter();
      
      SkBlendMode blendMode = *_blendModeProp->getDerivedValue();
      setImageFilter(context, SkImageFilters::Blend(blendMode, background, foreground));
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _blendModeProp = container->defineProperty(std::make_shared<BlendModeProp>(JsiPropId::get("mode")));
    _blendModeProp->require();
  }
  
private:
  BlendModeProp* _blendModeProp;
};

class JsiDropShadowImageFilterNode : public JsiBaseImageFilterNode,
public JsiDomNodeCtor<JsiDropShadowImageFilterNode> {
public:
  JsiDropShadowImageFilterNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseImageFilterNode(context, "skDropShadowImageFilter") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      auto color = _colorProp->getDerivedValue();
      auto dx = _dxProp->value()->getAsNumber();
      auto dy = _dxProp->value()->getAsNumber();
      auto blur = _blurProp->value()->getAsNumber();
      auto input = optionalChild(0);
      
      auto inner = _innerProp->isSet() && _innerProp->value()->getAsBool();
      auto shadowOnly = _shadowOnlyProp->isSet() && _shadowOnlyProp->value()->getAsBool();
      
      if (inner) {
        auto srcGraphic = SkImageFilters::ColorFilter(SkColorFilters::Blend(SK_ColorBLACK, SkBlendMode::kDst), nullptr);
        auto srcAlpha = SkImageFilters::ColorFilter(SkColorFilters::Blend(SK_ColorBLACK, SkBlendMode::kSrcIn), nullptr);
        auto f1 = SkImageFilters::ColorFilter(SkColorFilters::Blend(*color, SkBlendMode::kSrcOut), nullptr);
        auto f2 = SkImageFilters::Offset(dx, dy, f1);
        auto f3 = SkImageFilters::Blur(blur, blur, SkTileMode::kDecal, f2);
        auto f4 = SkImageFilters::Blend(SkBlendMode::kSrcIn, srcAlpha, f3);
        
        setImageFilter(context, SkImageFilters::Compose(input ? input->getImageFilter() : nullptr,                                
                                                        SkImageFilters::Blend(SkBlendMode::kSrcOver, srcGraphic, f4)));
        
      } else {
        setImageFilter(context, shadowOnly ?
                       SkImageFilters::DropShadowOnly(dx, dy, blur, blur, *color, input ? input->getImageFilter() : nullptr) :
                       SkImageFilters::DropShadow(dx, dy, blur, blur, *color, input ? input->getImageFilter() : nullptr));
      }
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _dxProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("dx")));
    _dyProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("dy")));
    _blurProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("blur")));
    _colorProp = container->defineProperty(std::make_shared<ColorProp>(JsiPropId::get("color")));
    
    _innerProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("inner")));
    _shadowOnlyProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("shadowOnly")));
    
    _dxProp->require();
    _dyProp->require();
    _blurProp->require();
    _colorProp->require();
  }
  
private:
  NodeProp* _dxProp;
  NodeProp* _dyProp;
  NodeProp* _blurProp;
  ColorProp* _colorProp;
  NodeProp* _innerProp;
  NodeProp* _shadowOnlyProp;
};

class JsiDisplacementMapImageFilterNode : public JsiBaseImageFilterNode,
public JsiDomNodeCtor<JsiDisplacementMapImageFilterNode> {
public:
  JsiDisplacementMapImageFilterNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseImageFilterNode(context, "skDisplacementMapImageFilter") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      
      auto channelX = getColorChannelFromStringValue(_channelXProp->value()->getAsString());
      auto channelY = getColorChannelFromStringValue(_channelYProp->value()->getAsString());
      auto scale = _scaleProp->value()->getAsNumber();
      
      auto displacement = requireChild(0);
      auto color = optionalChild(1);
      
      setImageFilter(context, SkImageFilters::DisplacementMap(channelX,
                                                              channelY,
                                                              scale,
                                                              displacement->getImageFilter(),
                                                              color ? color->getImageFilter() : nullptr));
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _channelXProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("channelX")));
    _channelYProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("channelY")));
    _scaleProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("scale")));
    
    _channelXProp->require();
    _channelYProp->require();
    _scaleProp->require();
  }
  
private:
  
  SkColorChannel getColorChannelFromStringValue(const std::string& value) {
    if (value == "r") {
      return SkColorChannel::kR;
    } else if (value == "g") {
      return SkColorChannel::kG;
    } else if (value == "b") {
      return SkColorChannel::kB;
    } else if (value == "a") {
      return SkColorChannel::kA;
    }
    throw std::runtime_error("Value \"" + value + "\" is not a valid color channel.");
  }
  
  NodeProp* _channelXProp;
  NodeProp* _channelYProp;
  NodeProp* _scaleProp;
};

class JsiBlurImageFilterNode : public JsiBaseImageFilterNode,
public JsiDomNodeCtor<JsiBlurImageFilterNode> {
public:
  JsiBlurImageFilterNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseImageFilterNode(context, "skBlurImageFilter") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      SkTileMode mode = getTileModeFromStringValue(_tileModeProp->value()->getAsString());
      auto input = optionalChild(0);
      setImageFilter(context, SkImageFilters::Blur(_radiusProp->getDerivedValue()->x(),
                                                   _radiusProp->getDerivedValue()->y(),
                                                   mode,
                                                   input ? input->getImageFilter() : nullptr));
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _radiusProp = container->defineProperty(std::make_shared<RadiusProp>(JsiPropId::get("radius")));
    _tileModeProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("tileMode")));
    
    _radiusProp->require();
    _tileModeProp->require();
  }
  
private:
  
  SkTileMode getTileModeFromStringValue(const std::string& value) {
    if (value == "clamp") {
      return SkTileMode::kClamp;
    } else if (value == "repeat") {
      return SkTileMode::kRepeat;
    } else if (value == "mirror") {
      return SkTileMode::kMirror;
    } else if (value == "decal") {
      return SkTileMode::kDecal;
    }
    throw std::runtime_error("Value \"" + value + "\" is not a valid tile mode.");
  }
  
  RadiusProp* _radiusProp;
  NodeProp* _tileModeProp;
};

class JsiOffsetImageFilterNode : public JsiBaseImageFilterNode,
public JsiDomNodeCtor<JsiOffsetImageFilterNode> {
public:
  JsiOffsetImageFilterNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseImageFilterNode(context, "skOffsetImageFilter") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      auto input = optionalChild(0);
      if (getPropsContainer()->isChanged()) {
        setImageFilter(context, SkImageFilters::Offset(_xProp->value()->getAsNumber(),
                                                       _yProp->value()->getAsNumber(),
                                                       input ? input->getImageFilter() : nullptr));
      }
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _xProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("x")));
    _yProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("y")));
    
    _xProp->require();
    _yProp->require();
  }
  
private:
  NodeProp* _xProp;
  NodeProp* _yProp;
};

class JsiMorphologyImageFilterNode : public JsiBaseImageFilterNode,
public JsiDomNodeCtor<JsiMorphologyImageFilterNode> {
public:
  enum Type {
    Dilate,
    Erode
  };
  
  JsiMorphologyImageFilterNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseImageFilterNode(context, "skMorphologyImageFilter") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      auto op = getTypeFromStringValue(_operatorProp->value()->getAsString());
      auto radius = _radiusProp->getDerivedValue();
      auto input = optionalChild(0);
      
      if (op == Type::Dilate) {
        setImageFilter(context, SkImageFilters::Dilate(radius->x(),
                                                       radius->y(),
                                                       input ? input->getImageFilter() : nullptr));
      } else {
        setImageFilter(context, SkImageFilters::Erode(radius->x(),
                                                      radius->y(),
                                                      input ? input->getImageFilter() : nullptr));
      }
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _operatorProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("operator")));
    _radiusProp = container->defineProperty(std::make_shared<RadiusProp>(JsiPropId::get("radius")));
    
    _operatorProp->require();
    _radiusProp->require();
  }
  
private:
  Type getTypeFromStringValue(const std::string& value) {
    if (value == "erode") {
      return Type::Erode;
    } else if (value == "dilate") {
      return Type::Dilate;
    }
    throw std::runtime_error("Value \"" + value + "\" is not valid for the operator property in the MorphologyImageFilter component.");
  }
  NodeProp* _operatorProp;
  RadiusProp* _radiusProp;
};

class JsiRuntimeShaderImageFilterNode : public JsiBaseImageFilterNode,
public JsiDomNodeCtor<JsiRuntimeShaderImageFilterNode> {
public:
  JsiRuntimeShaderImageFilterNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseImageFilterNode(context, "skRuntimeShaderImageFilter") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      auto runtimeEffectPtr = _runtimeEffectProp->value()->getAs<JsiSkRuntimeEffect>();
      if (runtimeEffectPtr == nullptr) {
        throw std::runtime_error("Expected runtime effect when reading source property of RuntimeEffectImageFilter.");
      }
      
      auto rtb = SkRuntimeShaderBuilder(runtimeEffectPtr->getObject());
      auto input = optionalChild(0);
      
      if (_uniformsProp->isSet()) {
        _uniformsProp->processUniforms(rtb, runtimeEffectPtr->getObject());
      }
      
      setImageFilter(context, SkImageFilters::RuntimeShader(rtb, nullptr, input ? input->getImageFilter() : nullptr));
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _runtimeEffectProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("source")));
    _uniformsProp = container->defineProperty(std::make_shared<UniformsProp>(JsiPropId::get("uniforms")));
    
    _runtimeEffectProp->require();
  }
  
private:
  NodeProp* _runtimeEffectProp;
  UniformsProp* _uniformsProp;
};

}
