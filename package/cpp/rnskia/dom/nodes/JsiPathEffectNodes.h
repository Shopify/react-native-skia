#pragma once

#include "JsiDomDeclarationNode.h"

#include "NodeProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPathEffect.h>

#pragma clang diagnostic pop

namespace RNSkia {

class JsiBasePathEffectNode: public JsiDomDeclarationNode {
public:
  JsiBasePathEffectNode(std::shared_ptr<RNSkPlatformContext> context,
                        const char* type) :
  JsiDomDeclarationNode(context, type) {}
  
  /**
   Returns the path effect
   */
  sk_sp<SkPathEffect> getPathEffect() {
    return _effect;
  }
  
protected:
  /**
   Validates that only path effect nodes can be children
   */
  virtual void addChild(std::shared_ptr<JsiDomNode> child) override {
    if ( std::dynamic_pointer_cast<JsiBasePathEffectNode>(child) == nullptr) {
      getContext()->raiseError(std::runtime_error("Cannot add a child of type \"" +
                                                  std::string(child->getType()) +
                                                  "\" to a \"" + std::string(getType()) + "\"."));
    }
    JsiDomNode::addChild(child);
  }
  
  /**
   Validates that only path effect nodes can be children
   */
  virtual void
  insertChildBefore(std::shared_ptr<JsiDomNode> child, std::shared_ptr<JsiDomNode> before) override {
    if (std::dynamic_pointer_cast<JsiBasePathEffectNode>(child) == nullptr) {
      getContext()->raiseError(std::runtime_error("Cannot add a child of type \"" +
                                                  std::string(child->getType()) +
                                                  "\" to a \"" + std::string(getType()) + "\"."));
    }
    JsiDomNode::insertChildBefore(child, before);
  }
  
  /**
   Sets or composes the path effect
   */
  void setPathEffect(DrawingContext* context, sk_sp<SkPathEffect> pathEffect) {
    _effect = pathEffect;
    auto paint = context->getMutablePaint();
    if (paint->getPathEffect() != nullptr) {
      paint->setPathEffect(SkPathEffect::MakeCompose(paint->refPathEffect(), pathEffect));
    } else {
      paint->setPathEffect(pathEffect);
    }
  }
  
  /*
   Clears the cached path effect - does not clear the path effect in paint
   */
  void clearCachedPathEffect() {
    _effect = nullptr;
  }
private:
  sk_sp<SkPathEffect> _effect;
};

class JsiDashPathEffectNode : public JsiBasePathEffectNode,
public JsiDomNodeCtor<JsiDashPathEffectNode> {
public:
  JsiDashPathEffectNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBasePathEffectNode(context, "skDashPathEffect") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (_intervals->isChanged() || _phase->isChanged()) {
      
      requirePropertyToBeSet(_intervals);      
      
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
    JsiDomDeclarationNode::defineProperties(container);
    
    _intervals = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("intervals")));
    _phase = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("phase")));
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
    if (_lengthProp->isChanged() ||
        _deviationProp->isChanged() ||
        _seedProp->isChanged()) {
      
      requirePropertyToBeSet(_lengthProp);
      requirePropertyToBeSet(_deviationProp);
      requirePropertyToBeSet(_seedProp);
      
      // Create effect
      auto pathEffect = SkDiscretePathEffect::Make(_lengthProp->value()->getAsNumber(),
                                                   _deviationProp->value()->getAsNumber(),
                                                   _seedProp->value()->getAsNumber());
      
      setPathEffect(context, pathEffect);
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDeclarationNode::defineProperties(container);
    
    _lengthProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("length")));
    _deviationProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("deviation")));
    _seedProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("seed")));
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
    if (_rProp->isChanged()) {
      
      requirePropertyToBeSet(_rProp);
      
      // Create effect
      auto pathEffect = SkCornerPathEffect::Make(_rProp->value()->getAsNumber());
      
      setPathEffect(context, pathEffect);
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDeclarationNode::defineProperties(container);
    
    _rProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("r")));
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
    if (_phaseProp->isChanged() ||
        _advanceProp->isChanged() ||
        _pathProp->isChanged() ||
        _styleProp->isChanged()) {
      
      requirePropertyToBeSet(_phaseProp);
      requirePropertyToBeSet(_advanceProp);
      requirePropertyToBeSet(_pathProp);
      requirePropertyToBeSet(_styleProp);
      
      // Create effect
      auto pathEffect = SkPath1DPathEffect::Make(*_pathProp->getDerivedValue(),
                                                 _advanceProp->value()->getAsNumber(),
                                                 _phaseProp->value()->getAsNumber(),
                                                 getStyleFromStringValue(_styleProp->value()->getAsString()));
      
      setPathEffect(context, pathEffect);
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDeclarationNode::defineProperties(container);
    
    _phaseProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("phase")));
    _advanceProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("advance")));
    _pathProp = container->defineProperty(std::make_shared<PathProp>(JsiPropId::get("path")));
    _styleProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("style")));
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
    if (_matrixProp->isChanged() || _pathProp->isChanged()) {
      
      requirePropertyToBeSet(_matrixProp);
      requirePropertyToBeSet(_pathProp);
      
      // Create effect
      auto pathEffect = SkPath2DPathEffect::Make(*_matrixProp->getDerivedValue(),
                                                 *_pathProp->getDerivedValue());
      
      setPathEffect(context, pathEffect);
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDeclarationNode::defineProperties(container);
    
    _matrixProp = container->defineProperty(std::make_shared<MatrixProp>(JsiPropId::get("matrix")));
    _pathProp = container->defineProperty(std::make_shared<PathProp>(JsiPropId::get("path")));
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
    if (_matrixProp->isChanged() || _widthProp->isChanged()) {
      
      requirePropertyToBeSet(_matrixProp);
      requirePropertyToBeSet(_widthProp);
      
      // Create effect
      auto pathEffect = SkLine2DPathEffect::Make(_widthProp->value()->getAsNumber(),
                                                 *_matrixProp->getDerivedValue());
      
      setPathEffect(context, pathEffect);
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDeclarationNode::defineProperties(container);
    
    _matrixProp = container->defineProperty(std::make_shared<MatrixProp>(JsiPropId::get("matrix")));
    _widthProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("width")));
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
  void addChild(std::shared_ptr<JsiDomNode> child) override {
    JsiBasePathEffectNode::addChild(child);
    clearCachedPathEffect();
  }
  
  /**
   Validates that only path effect nodes can be children
   */
  void
  insertChildBefore(std::shared_ptr<JsiDomNode> child, std::shared_ptr<JsiDomNode> before) override {
    JsiBasePathEffectNode::insertChildBefore(child, before);
    clearCachedPathEffect();
  }
  
  void removeChild(std::shared_ptr<JsiDomNode> child) override {
    JsiDomNode::removeChild(child);
    clearCachedPathEffect();
  }
  
  void materialize(DrawingContext* context) override {
    if (getPathEffect() == nullptr) {
      auto first = std::dynamic_pointer_cast<JsiBasePathEffectNode>(getChildren()[0]);
      auto second = std::dynamic_pointer_cast<JsiBasePathEffectNode>(getChildren()[1]);
      
      if (first == nullptr || second == nullptr) {
        throw std::runtime_error("Sum path effect needs two child nodes.");
      }
      
      setPathEffect(context, SkPathEffect::MakeSum(first->getPathEffect(),
                                                   second->getPathEffect()));
    }
  }
};
}
