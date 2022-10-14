#pragma once

#include "JsiDomDeclarationNode.h"

#include "NodeProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPathEffect.h>

#pragma clang diagnostic pop

namespace RNSkia {

class JsiBasePathEffectNode:
public JsiDomDeclarationNode<JsiBasePathEffectNode, sk_sp<SkPathEffect>> {
public:
  JsiBasePathEffectNode(std::shared_ptr<RNSkPlatformContext> context,
                        const char* type) :
  JsiDomDeclarationNode<JsiBasePathEffectNode, sk_sp<SkPathEffect>>(context, type) {}  
  
protected:
  void setPathEffect(DrawingContext* context, sk_sp<SkPathEffect> f) {
    set(context, f);
  }
  
  /**
   Sets or composes the path effect
   */
  void set(DrawingContext* context, sk_sp<SkPathEffect> pathEffect) override {
    auto paint = context->getMutablePaint();
    if (paint->getPathEffect() != nullptr && paint->getPathEffect() != getCurrent().get()) {
      paint->setPathEffect(SkPathEffect::MakeCompose(paint->refPathEffect(), pathEffect));
    } else {
      paint->setPathEffect(pathEffect);
    }
    setCurrent(pathEffect);
  }
};

class JsiDashPathEffectNode : public JsiBasePathEffectNode,
public JsiDomNodeCtor<JsiDashPathEffectNode> {
public:
  JsiDashPathEffectNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBasePathEffectNode(context, "skDashPathEffect") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      
      // Phase
      auto phase = _phase->isSet() ? _phase->value()->getAsNumber() : 0;
      
      // Copy intervals
      std::vector<SkScalar> intervals;
      auto intervalsArray = _intervals->value()->getAsArray();
      for (size_t i = 0; i < intervalsArray.size(); ++i) {
        intervals.push_back(intervalsArray[i]->getAsNumber());
      }
      
      // Create effect
      auto pathEffect = SkDashPathEffect::Make(intervals.data(),
                                               (int)intervals.size(),
                                               phase);
      
      setPathEffect(context, pathEffect);
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    
    _intervals = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("intervals")));
    _phase = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("phase")));
    
    _intervals->require();
  }
  
private:
  NodeProp* _intervals;
  NodeProp* _phase;
};

class JsiDiscretePathEffectNode : public JsiBasePathEffectNode,
public JsiDomNodeCtor<JsiDiscretePathEffectNode> {
public:
  JsiDiscretePathEffectNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBasePathEffectNode(context, "skDiscretePathEffect") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      
      // Create effect
      auto pathEffect = SkDiscretePathEffect::Make(_lengthProp->value()->getAsNumber(),
                                                   _deviationProp->value()->getAsNumber(),
                                                   _seedProp->value()->getAsNumber());
      
      setPathEffect(context, pathEffect);
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    
    _lengthProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("length")));
    _deviationProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("deviation")));
    _seedProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("seed")));
    
    _lengthProp->require();
    _deviationProp->require();
    _seedProp->require();
  }
  
private:
  NodeProp* _lengthProp;
  NodeProp* _deviationProp;
  NodeProp* _seedProp;
};

class JsiCornerPathEffectNode : public JsiBasePathEffectNode,
public JsiDomNodeCtor<JsiCornerPathEffectNode> {
public:
  JsiCornerPathEffectNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBasePathEffectNode(context, "skCornerPathEffect") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      
      // Create effect
      auto pathEffect = SkCornerPathEffect::Make(_rProp->value()->getAsNumber());
      
      setPathEffect(context, pathEffect);
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    
    _rProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("r")));
    _rProp->require();
  }
  
private:
  NodeProp* _rProp;  
};

class JsiPath1DPathEffectNode : public JsiBasePathEffectNode,
public JsiDomNodeCtor<JsiPath1DPathEffectNode> {
public:
  JsiPath1DPathEffectNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBasePathEffectNode(context, "skPath1DPathEffect") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      
      // Create effect
      auto pathEffect = SkPath1DPathEffect::Make(*_pathProp->getDerivedValue(),
                                                 _advanceProp->value()->getAsNumber(),
                                                 _phaseProp->value()->getAsNumber(),
                                                 getStyleFromStringValue(_styleProp->value()->getAsString()));
      
      setPathEffect(context, pathEffect);
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    
    _phaseProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("phase")));
    _advanceProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("advance")));
    _pathProp = container->defineProperty(std::make_shared<PathProp>(JsiPropId::get("path")));
    _styleProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("style")));
    
    _phaseProp->require();
    _advanceProp->require();
    _pathProp->require();
    _styleProp->require();
  }
  
private:
  SkPath1DPathEffect::Style getStyleFromStringValue(const std::string& value) {
    if (value == "translate") {
      return SkPath1DPathEffect::kTranslate_Style;
    } else if (value == "rotate") {
      return SkPath1DPathEffect::kRotate_Style;
    } else if (value == "morph") {
      return SkPath1DPathEffect::kMorph_Style;
    }
    throw std::runtime_error("Value \"" + value + "\" is not a valid Path1D effect style.");
  }
  
  NodeProp* _phaseProp;
  NodeProp* _advanceProp;
  NodeProp* _styleProp;
  PathProp* _pathProp;
};


class JsiPath2DPathEffectNode : public JsiBasePathEffectNode,
public JsiDomNodeCtor<JsiPath2DPathEffectNode> {
public:
  JsiPath2DPathEffectNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBasePathEffectNode(context, "skPath2DPathEffect") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      
      // Create effect
      auto pathEffect = SkPath2DPathEffect::Make(*_matrixProp->getDerivedValue(),
                                                 *_pathProp->getDerivedValue());
      
      setPathEffect(context, pathEffect);
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    
    _matrixProp = container->defineProperty(std::make_shared<MatrixProp>(JsiPropId::get("matrix")));
    _pathProp = container->defineProperty(std::make_shared<PathProp>(JsiPropId::get("path")));
    
    _matrixProp->require();
    _pathProp->require();
  }
  
private:
  MatrixProp* _matrixProp;
  PathProp* _pathProp;
};

class JsiLine2DPathEffectNode : public JsiBasePathEffectNode,
public JsiDomNodeCtor<JsiLine2DPathEffectNode> {
public:
  JsiLine2DPathEffectNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBasePathEffectNode(context, "skLine2DPathEffect") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      
      // Create effect
      auto pathEffect = SkLine2DPathEffect::Make(_widthProp->value()->getAsNumber(),
                                                 *_matrixProp->getDerivedValue());
      
      setPathEffect(context, pathEffect);
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    
    _matrixProp = container->defineProperty(std::make_shared<MatrixProp>(JsiPropId::get("matrix")));
    _widthProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("width")));
    
    _matrixProp->require();
    _widthProp->require();
  }
  
private:
  MatrixProp* _matrixProp;
  NodeProp* _widthProp;
};

class JsiSumPathEffectNode : public JsiBasePathEffectNode,
public JsiDomNodeCtor<JsiSumPathEffectNode> {
public:
  JsiSumPathEffectNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBasePathEffectNode(context, "skSumPathEffect") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      auto inner = requireChild(0);
      auto outer = requireChild(1);
      setPathEffect(context, SkPathEffect::MakeSum(inner->getCurrent(),
                                                   outer->getCurrent()));
    }
  }
};
}
