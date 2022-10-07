
#pragma once

#include "JsiDomNode.h"
#include "JsiDomDeclarationNode.h"
#include "DrawingContext.h"
#include "PointProp.h"
#include "MatrixProp.h"
#include "TransformProp.h"
#include "PaintProps.h"
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
  
  void render(DrawingContext* context) {
    // RNSkLogger::logToConsole("Begin render node %s", getType());
    if (_localContext == nullptr) {
      _localContext = context->createChildContext();
    }
    
    auto container = getPropsContainer();
    if (container == nullptr) {
      // A node might have an empty set of properties - then we can just render the node directly
      renderNode(_localContext.get());
      return;
    }
    
    // by visiting nodes we ensure that all updates and changes has been
    // read and handled.
    container->beginVisit(_localContext.get());
    
    auto shouldTransform = _matrixProp->hasValue() || _transformProp->hasValue();
    auto shouldSave = shouldTransform || _clipProp->hasValue();
    
    // Handle matrix/transforms
    if (shouldSave) {
      // Save canvas state
      _localContext->getCanvas()->save();
      
      if (_originProp->hasValue()) {
        // Handle origin
        _localContext->getCanvas()->translate(_originProp->getDerivedValue()->x(),
                                              _originProp->getDerivedValue()->y());
      }
      
      if (shouldTransform) {
        auto matrix = _matrixProp->hasValue() ?
        _matrixProp->getDerivedValue() : _transformProp->getDerivedValue();
        
        
        // Concat canvas' matrix with our matrix
        _localContext->getCanvas()->concat(*matrix);
      }
      
      // Clipping
      if (_clipProp->hasValue()) {
        auto invert = _invertClip->hasValue() && _invertClip->getValue()->getAsBool();        
        _clipProp->clip(_localContext->getCanvas(), invert);
      }
      
      if (_originProp->hasValue()) {
        // Handle origin
        _localContext->getCanvas()->translate(-_originProp->getDerivedValue()->x(),
                                              -_originProp->getDerivedValue()->y());
      }
    }
    
    // Update context
    materializeContext(_localContext.get());
    
    // Render the node
    renderNode(_localContext.get());
    
    // Restore if needed
    if (shouldSave) {
      _localContext->getCanvas()->restore();
    }
        
    // Mark container as done
    container->endVisit();
    
    // RNSkLogger::logToConsole("End rendering node %s", getType());
  };
  
protected:
  
  /**
   Override to implement rendering where the current state of the drawing context is correctly set.
   */
  virtual void renderNode(DrawingContext* context) = 0;
  
  /**
   Define common properties for all render nodes
   */
  virtual void defineProperties(NodePropsContainer* container) override {
    JsiDomNode::defineProperties(container);
    
    _paintProp = container->defineProperty(std::make_shared<PaintProps>());
    _opacityProp = container->defineProperty(std::make_shared<NodeProp>(PropNameOpacity));
    _matrixProp = container->defineProperty(std::make_shared<MatrixProp>(PropNameMatrix));
    _transformProp = container->defineProperty(std::make_shared<TransformProp>(PropNameTransform));
    _originProp = container->defineProperty(std::make_shared<PointProp>(PropNameOrigin));
    _clipProp = container->defineProperty(std::make_shared<ClipProp>(PropNameClip));
    _invertClip = container->defineProperty(std::make_shared<NodeProp>(PropNameInvertClip));
  }
  
private:
  void materializeContext(DrawingContext* context) {
    if (_opacityProp->hasValue() && (_opacityProp->isChanged() || context->isInvalid())) {
      context->setOpacity(_opacityProp->getValue()->getAsNumber());
    }
    
    // Enumerate children and let them add to the drawing context
    for (auto &child: getChildren()) {
      auto declarationNode = std::dynamic_pointer_cast<JsiDomDeclarationNode>(child);
      if (declarationNode != nullptr) {
        declarationNode->materializeNode(context);
      }
    }
  }
  
  std::vector<BaseNodeProp> _props;
  std::shared_ptr<PointProp> _originProp;
  std::shared_ptr<MatrixProp> _matrixProp;
  std::shared_ptr<TransformProp> _transformProp;
  std::shared_ptr<PaintProps> _paintProp;
  std::shared_ptr<NodeProp> _opacityProp;
  std::shared_ptr<NodeProp> _invertClip;
  std::shared_ptr<ClipProp> _clipProp;
  
  std::shared_ptr<DrawingContext> _localContext;

};

}
