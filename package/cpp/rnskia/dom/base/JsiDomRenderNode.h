
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
    // RNSkLogger::logToConsole("Render node %s", getType());
    
    // Ensure we have a local context
    if (_localContext == nullptr) {
      _localContext = context->inheritContext(getType());
    }
    
    // The props container is the storage for JS values that are passed as
    // properties for nodes.
    auto container = getPropsContainer();
    
    // by visiting nodes we ensure that all updates and changes has been
    // read and handled for properties. This is also (with the symmetric endVisit)
    // how we handle changed properties to avoid updating unecessarily.
    container->beginVisit(_localContext.get());
    
    // Opacity (paint prop resolves in beginVisit in the PaintProp class)
    if (_opacityProp->hasValue() && (_opacityProp->isChanged() || _localContext->isInvalid())) {
      _localContext->setOpacity(_opacityProp->getValue()->getAsNumber());
    }
    
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
  
  /**
   Signal from the JS side that the node is removed from the dom.
   */
  void dispose() override {
    JsiDomNode::dispose();
    
    // Clear local drawing context
    if (_localContext != nullptr) {
      _localContext->dispose();
      _localContext = nullptr;
    }
  }
  
protected:
  
  /**
   Override to implement rendering where the current state of the drawing context is correctly set.
   */
  virtual void renderNode(DrawingContext* context) {
    if (context == nullptr) {
      return;
    }
    
    // Render and materialize children
    for (auto &child: getChildren()) {
      // Try node as render node
      auto renderNode = std::dynamic_pointer_cast<JsiDomRenderNode>(child);
      if (renderNode != nullptr) {
        renderNode->render(context);
      }
      
      // Try node as declaration node
      auto declarationNode = std::dynamic_pointer_cast<JsiDomDeclarationNode>(child);
      if (declarationNode != nullptr) {
        declarationNode->materializeNode(context);
      }
    }
  };
  
  /**
   Define common properties for all render nodes
   */
  virtual void defineProperties(NodePropsContainer* container) override {
    JsiDomNode::defineProperties(container);
    
    container->defineProperty(std::make_shared<PaintProps>());
    
    _opacityProp = container->defineProperty(std::make_shared<NodeProp>(PropNameOpacity));
    _matrixProp = container->defineProperty(std::make_shared<MatrixProp>(PropNameMatrix));
    _transformProp = container->defineProperty(std::make_shared<TransformProp>(PropNameTransform));
    _originProp = container->defineProperty(std::make_shared<PointProp>(PropNameOrigin));
    _clipProp = container->defineProperty(std::make_shared<ClipProp>(PropNameClip));
    _invertClip = container->defineProperty(std::make_shared<NodeProp>(PropNameInvertClip));
  }
  
private:
  PointProp* _originProp;
  MatrixProp* _matrixProp;
  TransformProp* _transformProp;
  NodeProp* _opacityProp;
  NodeProp* _invertClip;
  ClipProp* _clipProp;
  
  std::shared_ptr<DrawingContext> _localContext;
};

}
