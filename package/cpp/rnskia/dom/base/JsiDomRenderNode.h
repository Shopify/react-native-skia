
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
#include "LayerProp.h"

namespace RNSkia {

static PropId PropNameOrigin = JsiPropId::get("origin");
static PropId PropNameOpacity = JsiPropId::get("opacity");
static PropId PropNameClip = JsiPropId::get("clip");
static PropId PropNameInvertClip = JsiPropId::get("invertClip");
static PropId PropNameLayer = JsiPropId::get("layer");

class JsiDomRenderNode : public JsiDomNode {
public:
  JsiDomRenderNode(std::shared_ptr<RNSkPlatformContext> context,
                   const char* type) : JsiDomNode(context, type) {}
  
  void render(DrawingContext* context) {
#if SKIA_DOM_DEBUG
    RNSkLogger::logToConsole("%sRendering node %s",
                             getLevelIndentation().c_str(),
                             getType());
#endif
    
    // Ensure property changes has been registered
    updatePendingProperties();
    
    // Ensure we have a local drawing context inheriting from the parent context
    if (_localContext == nullptr) {
      _localContext = context->inheritContext(getType());
    }
    
    auto shouldTransform = _matrixProp->isSet() || _transformProp->isSet();
    auto shouldSave = shouldTransform || _clipProp->isSet() || _layerProp->isSet();
    
    // Handle matrix/transforms
    if (shouldSave) {
      // Save canvas state
      if (_layerProp->isSet()) {
        if (_layerProp->isBool()) {
          _localContext->getCanvas()->saveLayer(SkCanvas::SaveLayerRec(nullptr, nullptr, nullptr, 0));
        } else {
          _localContext->getCanvas()->saveLayer(SkCanvas::SaveLayerRec(nullptr,
                                                                       _layerProp->getDerivedValue().get(),
                                                                       nullptr,
                                                                       0));
        }
      } else {
        _localContext->getCanvas()->save();
      }
      
      if (_originProp->isSet()) {
        // Handle origin
        _localContext->getCanvas()->translate(_originProp->getDerivedValue()->x(),
                                              _originProp->getDerivedValue()->y());
      }
      
      if (shouldTransform) {
        auto matrix = _matrixProp->isSet() ?
        _matrixProp->getDerivedValue() : _transformProp->getDerivedValue();
        
        // Concat canvas' matrix with our matrix
        _localContext->getCanvas()->concat(*matrix);
      }
      
      // Clipping
      if (_clipProp->isSet()) {
        auto invert = _invertClip->isSet() && _invertClip->value()->getAsBool();        
        _clipProp->clip(_localContext->getCanvas(), invert);
      }
      
      if (_originProp->isSet()) {
        // Handle origin
        _localContext->getCanvas()->translate(-_originProp->getDerivedValue()->x(),
                                              -_originProp->getDerivedValue()->y());
      }
    }
    
    // Let any local paint props decorate the context
    _paintProps->materialize(_localContext.get());
    
    // Now let's make sure the local context is resolved correctly - ie. that
    // all children of type declaration (except paint) is given the opportunity to
    // decorate the context.
    materializeDeclarations();
    
    
    // Render the node
    renderNode(_localContext.get());
    
    // Restore if needed
    if (shouldSave) {
      _localContext->getCanvas()->restore();
    }
    
    // Resolve changes
    markPropertiesAsResolved();
    
#if SKIA_DOM_DEBUG
    RNSkLogger::logToConsole("%sEnd rendering node %s",
                             getLevelIndentation().c_str(),
                             getType());
#endif
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
  virtual void renderNode(DrawingContext* context) = 0;
  
  /**
   Removes a child
   */
  virtual void removeChild(std::shared_ptr<JsiDomNode> child) override {
    JsiDomNode::removeChild(child);
    if (_localContext != nullptr) {
      _localContext->invalidate();
    }
  }
  
  /**
   Validates that only declaration nodes can be children
   */
  virtual void addChild(std::shared_ptr<JsiDomNode> child) override {
    JsiDomNode::addChild(child);
    if (_localContext != nullptr) {
      _localContext->invalidate();
    }
  }
  
  /**
   Validates that only declaration nodes can be children
   */
  virtual void
  insertChildBefore(std::shared_ptr<JsiDomNode> child, std::shared_ptr<JsiDomNode> before) override {
    JsiDomNode::insertChildBefore(child, before);
    if (_localContext != nullptr) {
      _localContext->invalidate();
    }
  }
  
  /**
   Define common properties for all render nodes
   */
  virtual void defineProperties(NodePropsContainer* container) override {
    JsiDomNode::defineProperties(container);
    
    _paintProps = container->defineProperty(std::make_shared<PaintProps>());
    
    _matrixProp = container->defineProperty(std::make_shared<MatrixProp>(PropNameMatrix));
    _transformProp = container->defineProperty(std::make_shared<TransformProp>(PropNameTransform));
    _originProp = container->defineProperty(std::make_shared<PointProp>(PropNameOrigin));
    _clipProp = container->defineProperty(std::make_shared<ClipProp>(PropNameClip));
    _invertClip = container->defineProperty(std::make_shared<NodeProp>(PropNameInvertClip));
    _layerProp = container->defineProperty(std::make_shared<LayerProp>(PropNameLayer));
  }
  
private:
  
  /**
   Loops through all declaration nodes and gives each one of them the opportunity to decorate the context
   */
  void materializeDeclarations() {
    for (auto &child: getChildren()) {
      auto ptr = std::dynamic_pointer_cast<JsiBaseDomDeclarationNode>(child);
      if (ptr != nullptr) {
        ptr->materializeNode(_localContext.get());
      }
    }
  }
  
  PointProp* _originProp;
  MatrixProp* _matrixProp;
  TransformProp* _transformProp;
  NodeProp* _invertClip;
  ClipProp* _clipProp;
  LayerProp* _layerProp;
  PaintProps* _paintProps;
  
  std::shared_ptr<DrawingContext> _localContext;
};

}
