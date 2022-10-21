#pragma once

#include "JsiDomDeclarationNode.h"

#include "NodeProp.h"
#include "BlendModeProp.h"
#include "ColorProp.h"
#include "UniformsProp.h"
#include "TransformsProps.h"
#include "TileModeProp.h"
#include "NumbersProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkShader.h>

#pragma clang diagnostic pop

namespace RNSkia {

class JsiBaseShaderNode:
public JsiDomDeclarationNode<JsiBaseShaderNode, sk_sp<SkShader>> {
public:
  JsiBaseShaderNode(std::shared_ptr<RNSkPlatformContext> context,
                         const char* type) :
  JsiDomDeclarationNode<JsiBaseShaderNode, sk_sp<SkShader>>(context, type) {}
  
protected:
  sk_sp<SkShader> resolve(std::shared_ptr<JsiDomNode> child) override {
    auto ptr = std::dynamic_pointer_cast<JsiBaseShaderNode>(child);
    if (ptr) {
      return ptr->getCurrent();
    }
    return nullptr;
  }
  
  void setShader(DrawingContext* context, sk_sp<SkShader> f) {
    set(context, f);
  }
  
  void set(DrawingContext* context, sk_sp<SkShader> shader) override {
    auto paint = context->getMutablePaint();
    paint->setShader(shader);
    setCurrent(shader);
  }
};

class JsiShaderNode : public JsiBaseShaderNode,
public JsiDomNodeCtor<JsiShaderNode> {
public:
  JsiShaderNode(std::shared_ptr<RNSkPlatformContext> context):
  JsiBaseShaderNode(context, "skShader") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      auto source = _sourceProp->value()->getAs<JsiSkRuntimeEffect>();
      if (source == nullptr) {
        throw std::runtime_error("Expected runtime effect when reading source property of RuntimeEffectImageFilter.");
      }
      auto uniforms = _uniformsProp->isSet() ? _uniformsProp->getDerivedValue() : nullptr;
      auto localMatrix = _transformProp->isSet() ? _transformProp->getDerivedValue() : nullptr;
      
      // get all children that are shader nodes
      std::vector<sk_sp<SkShader>> children;
      children.reserve(getChildren().size());
      for (auto &child: getChildren()) {
        auto ptr = std::dynamic_pointer_cast<JsiBaseShaderNode>(child);
        if (ptr != nullptr) {
          children.push_back(ptr->getCurrent());
        }
      }
      
      // Update shader
      setShader(context, source->getObject()->makeShader(uniforms, children.data(), children.size(), localMatrix.get()));
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _sourceProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("source")));
    _uniformsProp = container->defineProperty(std::make_shared<UniformsProp>(JsiPropId::get("uniforms"), _sourceProp));
    _transformProp = container->defineProperty(std::make_shared<TransformProp>(JsiPropId::get("transform")));
    
    _sourceProp->require();
  }
  
private:
  NodeProp* _sourceProp;
  UniformsProp* _uniformsProp;
  TransformProp* _transformProp;
};

class JsiImageShaderNode : public JsiBaseShaderNode,
public JsiDomNodeCtor<JsiImageShaderNode> {
public:
  JsiImageShaderNode(std::shared_ptr<RNSkPlatformContext> context):
  JsiBaseShaderNode(context, "skImageShader") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      auto image = _imageProps->getImage();
      auto rect = _imageProps->getRect();
      auto lm = _transformProp->isSet() ? _transformProp->getDerivedValue().get() : nullptr;
      
      if (rect != nullptr && lm != nullptr) {
        auto rc = _imageProps->getDerivedValue();
        auto m3 = _imageProps->rect2rect(rc->src, rc->dst);
        lm->preTranslate(m3.x(), m3.y());
        lm->preScale(m3.width(), m3.height());
      }
      
      setShader(context, image->makeShader(*_txProp->getDerivedValue(),
                                           *_tyProp->getDerivedValue(),
                                           SkSamplingOptions(getFilterModeFromString(_filterModeProp->value()->getAsString()),
                                                             getMipmapModeFromString(_mipmapModeProp->value()->getAsString())),
                                           lm));
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _txProp = container->defineProperty(std::make_shared<TileModeProp>(JsiPropId::get("tx")));
    _tyProp = container->defineProperty(std::make_shared<TileModeProp>(JsiPropId::get("ty")));
    _filterModeProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("fm")));
    _mipmapModeProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("mm")));
    
    _imageProps = container->defineProperty(std::make_shared<ImageProps>());
    _transformProp = container->defineProperty(std::make_shared<TransformProp>(JsiPropId::get("transform")));
    
    _txProp->require();
    _tyProp->require();
    _filterModeProp->require();
    _mipmapModeProp->require();
    
    _transformProp->require();
    
    // Just require the image
    container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("image")))->require();
  }

private:
  SkFilterMode getFilterModeFromString(const std::string& value) {
    if (value == "last") {
      return SkFilterMode::kLast;
    } else if (value == "linear") {
      return SkFilterMode::kLinear;
    } else if (value == "nearest") {
      return SkFilterMode::kNearest;
    }
    throw std::runtime_error("The value \"" + value + "\" is not a valid Filter Mode.");
  }
  
  SkMipmapMode getMipmapModeFromString(const std::string& value) {
    if (value == "last") {
      return SkMipmapMode::kLast;
    } else if (value == "last") {
      return SkMipmapMode::kLast;
    } else if (value == "last") {
      return SkMipmapMode::kLast;
    } else if (value == "none") {
      return SkMipmapMode::kNone;
    }
    throw std::runtime_error("The value \"" + value + "\" is not a valid Mipmap Mode.");
  }
  
  TileModeProp* _txProp;
  TileModeProp* _tyProp;
  NodeProp* _filterModeProp;
  NodeProp* _mipmapModeProp;
  ImageProps* _imageProps;
  TransformProp* _transformProp;
};

class JsiColorShaderNode : public JsiBaseShaderNode,
public JsiDomNodeCtor<JsiColorShaderNode> {
public:
  JsiColorShaderNode(std::shared_ptr<RNSkPlatformContext> context):
  JsiBaseShaderNode(context, "skColorShader") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      if (_colorProp->isSet()) {
        setShader(context, SkShaders::Color(*_colorProp->getDerivedValue()));
      } else {
        setShader(context, nullptr);
      }
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _colorProp = container->defineProperty(std::make_shared<ColorProp>(JsiPropId::get("color")));
    _colorProp->require();
  }
private:
  ColorProp* _colorProp;
};

class JsiBasePerlinNoiseNode : public JsiBaseShaderNode {
public:
  JsiBasePerlinNoiseNode(std::shared_ptr<RNSkPlatformContext> context, PropId type):
    JsiBaseShaderNode(context, type) {}
    
protected:
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _freqXProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("freqX")));
    _freqYProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("freqY")));
    _octavesProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("octaves")));
    _seedProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("seed")));
    _tileWidthProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("tileWidth")));
    _tileHeightProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("tileHeight")));
    
    _freqXProp->require();
    _freqYProp->require();
    _octavesProp->require();
    _seedProp->require();
    _tileWidthProp->require();
    _tileHeightProp->require();
  }

  NodeProp* _freqXProp;
  NodeProp* _freqYProp;
  NodeProp* _octavesProp;
  NodeProp* _seedProp;
  NodeProp* _tileWidthProp;
  NodeProp* _tileHeightProp;
};

class JsiTurbulenceNode: public JsiBasePerlinNoiseNode,
public JsiDomNodeCtor<JsiTurbulenceNode> {
public:
  JsiTurbulenceNode(std::shared_ptr<RNSkPlatformContext> context):
  JsiBasePerlinNoiseNode(context, "skTurbulence") {}
  
protected:
  virtual void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      SkISize size = SkISize::Make(_tileWidthProp->value()->getAsNumber(),
                                   _tileHeightProp->value()->getAsNumber());
      
      setShader(context, SkPerlinNoiseShader::MakeTurbulence(_freqXProp->value()->getAsNumber(),
                                                             _freqYProp->value()->getAsNumber(),
                                                             _octavesProp->value()->getAsNumber(),
                                                             _seedProp->value()->getAsNumber(),
                                                             &size));
    }
  }
};

class JsiFractalNoiseNode : public JsiBasePerlinNoiseNode,
public JsiDomNodeCtor<JsiFractalNoiseNode> {
public:
  JsiFractalNoiseNode(std::shared_ptr<RNSkPlatformContext> context):
  JsiBasePerlinNoiseNode(context, "skFractalNoise") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      SkISize size = SkISize::Make(_tileWidthProp->value()->getAsNumber(),
                                   _tileHeightProp->value()->getAsNumber());
      
      setShader(context, SkPerlinNoiseShader::MakeFractalNoise(_freqXProp->value()->getAsNumber(),
                                                               _freqYProp->value()->getAsNumber(),
                                                               _octavesProp->value()->getAsNumber(),
                                                               _seedProp->value()->getAsNumber(),
                                                               &size));
    }
  }
};

class JsiBaseGradientNode: public JsiBaseShaderNode {
public:
  JsiBaseGradientNode(std::shared_ptr<RNSkPlatformContext> context,
                      PropId type):
  JsiBaseShaderNode(context, type) {}
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _transformsProps = container->defineProperty(std::make_shared<TransformsProps>());
    
    _colorsProp = container->defineProperty(std::make_shared<ColorsProp>(JsiPropId::get("colors")));
    _positionsProp = container->defineProperty(std::make_shared<NumbersProp>(JsiPropId::get("positions")));
    _modeProp = container->defineProperty(std::make_shared<TileModeProp>(JsiPropId::get("mode")));
    _flagsProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("flags")));
    
    _colorsProp->require();
  }
  
protected:
  void materialize(DrawingContext* context) override {
    if(isChanged(context)) {
      _colors = _colorsProp->getDerivedValue()->data();
      _colorCount = static_cast<int>(_colorsProp->getDerivedValue()->size());
      _flags = _flagsProp->isSet() ? _flagsProp->value()->getAsNumber() : 0;
      _mode = _modeProp->isSet() ? *_modeProp->getDerivedValue() : SkTileMode::kClamp;
      _positions = _positionsProp->isSet() ? _positionsProp->getDerivedValue()->data() : nullptr;
      _matrix = _transformsProps->isSet() ? _transformsProps->getDerivedValue().get() : nullptr;
    }
  }
  
  SkColor* _colors;
  SkTileMode _mode;
  double _flags;
  SkScalar* _positions;
  SkMatrix* _matrix;
  int _colorCount;
  
private:
  TransformsProps* _transformsProps;
  ColorsProp* _colorsProp;
  NumbersProp* _positionsProp;
  TileModeProp* _modeProp;
  NodeProp* _flagsProp;
};

class JsiLinearGradientNode : public JsiBaseGradientNode,
public JsiDomNodeCtor<JsiLinearGradientNode> {
public:
  JsiLinearGradientNode(std::shared_ptr<RNSkPlatformContext> context):
  JsiBaseGradientNode(context, "skLinearGradient") {}
protected:
  void materialize(DrawingContext* context) override {
    JsiBaseGradientNode::materialize(context);
    
    if (isChanged(context)) {
      SkPoint pts[] = { *_startProp->getDerivedValue(), *_endProp->getDerivedValue()};
      setShader(context, SkGradientShader::MakeLinear(pts,
                                                      _colors,
                                                      _positions,
                                                      _colorCount,
                                                      _mode,
                                                      _flags,
                                                      _matrix));
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseGradientNode::defineProperties(container);
    _startProp = container->defineProperty(std::make_shared<PointProp>(JsiPropId::get("start")));
    _endProp = container->defineProperty(std::make_shared<PointProp>(JsiPropId::get("end")));
    
    _startProp->require();
    _endProp->require();
  }
private:
  PointProp* _startProp;
  PointProp* _endProp;
};

class JsiRadialGradientNode : public JsiBaseGradientNode,
public JsiDomNodeCtor<JsiRadialGradientNode> {
public:
  JsiRadialGradientNode(std::shared_ptr<RNSkPlatformContext> context):
  JsiBaseGradientNode(context, "skRadialGradient") {}
    
protected:
  void materialize(DrawingContext* context) override {
    JsiBaseGradientNode::materialize(context);
    
    if (isChanged(context)) {
      auto c = _centerProp->getDerivedValue();
      auto r = _radiusProp->value()->getAsNumber();
      setShader(context, SkGradientShader::MakeRadial(*c,
                                                      r,
                                                      _colors,
                                                      _positions,
                                                      _colorCount,
                                                      _mode,
                                                      _flags,
                                                      _matrix));
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseGradientNode::defineProperties(container);
    _centerProp = container->defineProperty(std::make_shared<PointProp>(JsiPropId::get("c")));
    _radiusProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("r")));
    
    _centerProp->require();
    _radiusProp->require();
  }
private:
  PointProp* _centerProp;
  NodeProp* _radiusProp;
};

class JsiSweepGradientNode : public JsiBaseGradientNode,
public JsiDomNodeCtor<JsiSweepGradientNode> {
public:
  JsiSweepGradientNode(std::shared_ptr<RNSkPlatformContext> context):
  JsiBaseGradientNode(context, "skSweepGradient") {}
    
protected:
  void materialize(DrawingContext* context) override {
    JsiBaseGradientNode::materialize(context);
    
    if (isChanged(context)) {
      auto start = _startProp->isSet() ? _startProp->value()->getAsNumber() : 0;
      auto end = _endProp->isSet() ? _endProp->value()->getAsNumber() : 360;
      auto c = _centerProp->getDerivedValue();
      
      setShader(context, SkGradientShader::MakeSweep(c->x(),
                                                     c->y(),
                                                     _colors,
                                                     _positions,
                                                     _colorCount,
                                                     _mode,
                                                     start,
                                                     end,
                                                     _flags,
                                                     _matrix));
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseGradientNode::defineProperties(container);
    _startProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("start")));
    _endProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("end")));
    _centerProp = container->defineProperty(std::make_shared<PointProp>(JsiPropId::get("c")));
  }
private:
  PointProp* _centerProp;
  NodeProp* _startProp;
  NodeProp* _endProp;
};

class JsiTwoPointConicalGradientNode : public JsiBaseGradientNode,
public JsiDomNodeCtor<JsiTwoPointConicalGradientNode> {
public:
  JsiTwoPointConicalGradientNode(std::shared_ptr<RNSkPlatformContext> context):
  JsiBaseGradientNode(context, "skTwoPointConicalGradient") {}
    
protected:
  void materialize(DrawingContext* context) override {
    JsiBaseGradientNode::materialize(context);
    
    if (isChanged(context)) {
      auto start = _startProp->getDerivedValue();
      auto end = _endProp->getDerivedValue();
      auto startR = _startRProp->value()->getAsNumber();
      auto endR = _endRProp->value()->getAsNumber();
      
      setShader(context, SkGradientShader::MakeTwoPointConical(*start, startR, *end, endR,
                                                               _colors,
                                                               _positions,
                                                               _colorCount,
                                                               _mode,
                                                               _flags,
                                                               _matrix));
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseGradientNode::defineProperties(container);
    _startProp = container->defineProperty(std::make_shared<PointProp>(JsiPropId::get("start")));
    _startRProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("startR")));
    _endProp = container->defineProperty(std::make_shared<PointProp>(JsiPropId::get("end")));
    _endRProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("endR")));
  }
private:
  PointProp* _startProp;
  NodeProp* _startRProp;
  PointProp* _endProp;
  NodeProp* _endRProp;
};

}
