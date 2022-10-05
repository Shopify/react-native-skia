
#pragma once

#include "JsiDomNode.h"
#include "JsiDomDeclarationNode.h"
#include "JsiDrawingContext.h"
#include "PointProp.h"
#include "MatrixProp.h"
#include "TransformProp.h"
#include "PaintProp.h"
#include "RectProp.h"
#include "RRectProp.h"
#include "ClipProp.h"

#include "JsiDomDeclarationNode.h"

namespace RNSkia {

static PropId PropNameOrigin = JsiPropId::get("origin");
static PropId PropNameOpacity = JsiPropId::get("opacity");
static PropId PropNameClip = JsiPropId::get("clip");
static PropId PropNameInvertClip = JsiPropId::get("invertClip");

class JsiDomRenderNode : public JsiDomNode {
public:
  JsiDomRenderNode(std::shared_ptr<RNSkPlatformContext> context,
                   const char* type) : JsiDomNode(context, type) {}
  
  void render(JsiDrawingContext* context) {
    
    auto container = getPropsContainer();
    if (container == nullptr) {
      // A node might have an empty set of properties - then we can just render the node directly
      renderNode(context);
      return;
    }
    
    // by visiting nodes we ensure that all updates and changes has been
    // read and handled.
    container->beginVisit(context);
    
    auto shouldTransform = _matrixProp->hasValue() || _transformProp->hasValue();
    auto shouldSave = shouldTransform || _clipProp->hasValue();
    
    // Handle matrix/transforms
    if (shouldSave) {
      // Save canvas state
      context->getCanvas()->save();
      
      if (_originProp->hasValue()) {
        // Handle origin
        context->getCanvas()->translate(_originProp->getDerivedValue()->x(),
                                        _originProp->getDerivedValue()->y());
      }
      
      if (shouldTransform) {
        auto matrix = _matrixProp->hasValue() ?
        _matrixProp->getDerivedValue() : _transformProp->getDerivedValue();
        
        
        // Concat canvas' matrix with our matrix
        context->getCanvas()->concat(*matrix);
      }
      
      // Clipping
      if (_clipProp->hasValue()) {
        auto invert = _invertClip->hasValue() && _invertClip->getValue()->getAsBool();        
        _clipProp->clip(context->getCanvas(), invert);
      }
      
      if (_originProp->hasValue()) {
        // Handle origin
        context->getCanvas()->translate(-_originProp->getDerivedValue()->x(),
                                        -_originProp->getDerivedValue()->y());
      }
    }
    
    // Render the node
    renderNode(materializeContext(context));
    
    // Restore if needed
    if (shouldSave) {
      context->getCanvas()->restore();
    }
        
    // Mark container as done
    container->endVisit();
  };
  
protected:
  
  /**
   Override to implement rendering where the current state of the drawing context is correctly set.
   */
  virtual void renderNode(JsiDrawingContext* context) = 0;
  
  /**
   Define common properties for all render nodes
   */
  virtual void defineProperties(NodePropsContainer* container) override {
    JsiDomNode::defineProperties(container);
    
    _paintProp = container->defineProperty(std::make_shared<PaintProp>());
    _opacityProp = container->defineProperty(std::make_shared<NodeProp>(PropNameOpacity));
    _matrixProp = container->defineProperty(std::make_shared<MatrixProp>(PropNameMatrix));
    _transformProp = container->defineProperty(std::make_shared<TransformProp>(PropNameTransform));
    _originProp = container->defineProperty(std::make_shared<PointProp>(PropNameOrigin));
    _clipProp = container->defineProperty(std::make_shared<ClipProp>(PropNameClip));
    _invertClip = container->defineProperty(std::make_shared<NodeProp>(PropNameInvertClip));
  }
  
private:
  /**
   Returns true if any of the child nodes have changes
   */
  bool getChildDeclarationNodesHasPropertyChanged() {
    for (auto &child: getChildren()) {
      auto declarationNode = std::dynamic_pointer_cast<JsiDomDeclarationNode>(child);
      if (declarationNode != nullptr) {
        if (declarationNode->getPropsContainer()->getHasPropChanges()) {
          return true;
        }
      }
    }
    return false;
  }
  
  JsiDrawingContext* materializeContext(JsiDrawingContext* context) {
    // auto container = getPropsContainer();
    // We only need to update the cached context if the paint property or opacity property has changed
    if (_paintProp->isChanged() ||
        getChildDeclarationNodesHasPropertyChanged() ||
        context->hasChanged() ||
        // container->getHasPropChanges(PropNameOpacity) ||
        _opacity != context->getOpacity()) {
      
      // Paint - start by getting paint from parent context
      auto paint = context->getPaint();
      
      // If our child paint has a value we can use it.
      if (_paintProp->getDerivedValue() != nullptr) {
        paint = _paintProp->getDerivedValue();
      }
      
      // Opacity
      _opacity = context->getOpacity();
      if (_opacityProp->hasValue()) {
        _opacity *= _opacityProp->getValue()->getAsNumber();
        // TODO: Is this enough to override the opacity correctly?
        paint->setAlpha(255 * _opacity);
      }
      
      // Create the cached drawing context if it is not set
      if (_cachedContext == nullptr) {
        _cachedContext = std::make_shared<JsiDrawingContext>(context, paint, _opacity);
      } else {
        _cachedContext->setPaint(paint);
        _cachedContext->setOpacity(_opacity);
      }
      
      // Enumerate children and let them modify the drawing context
      for (auto &child: getChildren()) {
        auto declarationNode = std::dynamic_pointer_cast<JsiDomDeclarationNode>(child);
        if (declarationNode != nullptr) {
          declarationNode->materializeNode(_cachedContext.get());
        }
      }
    }
    
    // Update canvas - it might change on each frame
    if (_cachedContext != nullptr) {
      _cachedContext->setCanvas(context->getCanvas());
    }
    
    return _cachedContext != nullptr ? _cachedContext.get() : context;
  }
  
  double _opacity;
  
  std::vector<BaseNodeProp> _props;
  std::shared_ptr<PointProp> _originProp;
  std::shared_ptr<MatrixProp> _matrixProp;
  std::shared_ptr<TransformProp> _transformProp;
  std::shared_ptr<PaintProp> _paintProp;
  std::shared_ptr<NodeProp> _opacityProp;
  std::shared_ptr<NodeProp> _invertClip;
  std::shared_ptr<ClipProp> _clipProp;
  
  std::shared_ptr<JsiDrawingContext> _cachedContext;
};

}
