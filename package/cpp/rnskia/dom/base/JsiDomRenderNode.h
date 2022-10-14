
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
    
    // Ensure we have a local context
    if (_localContext == nullptr) {
      _localContext = context->inheritContext(getType());
    }
    
    // The props container is the storage for JS values that are passed as
    // properties for nodes.
    auto container = getPropsContainer();
    
    // by visiting nodes we ensure that all updates and changes has been
    // read and handled for properties. This is also (with the symmetric marksAsResolved)
    // how we handle changed properties to avoid updating unecessarily.
    container->updatePendingValues(_localContext.get(), getType());
    
    // Opacity (paint prop resolves in updatePendingValues in the PaintProp class)
    if (_opacityProp->isSet() && (_opacityProp->isChanged() || _localContext->isInvalid())) {
      _localContext->setOpacity(_opacityProp->value()->getAsNumber());
    }
    
    auto shouldTransform = _matrixProp->isSet() || _transformProp->isSet();
    auto shouldSave = shouldTransform || _clipProp->isSet() || _layerProp->isSet();
    
    // Handle matrix/transforms
    if (shouldSave) {
      // Save canvas state
      if (_layerProp->isSet()) {
        if (_layerProp->value()->getType() == PropType::Bool) {
          // Just layer with empty bounds
          _localContext->getCanvas()->saveLayer(SkCanvas::SaveLayerRec(nullptr, nullptr, nullptr, 0));
        } else if (_layerProp->value()->getType() == PropType::HostObject) {
          // Check for type, can be either paint or declaration node
          auto ptr = std::dynamic_pointer_cast<JsiSkPaint>(_layerProp->value()->getAsHostObject());
          if (ptr != nullptr) {
            _localContext->getCanvas()->saveLayer(SkCanvas::SaveLayerRec(nullptr,
                                                                         ptr->getObject().get(),
                                                                         nullptr,
                                                                         0));
          } else {
            // TODO: Have not found an example of using a declaration node!?
            throw std::runtime_error("Could not read the layer property of the node.");
          }
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
    
    // Render the node
    renderNode(_localContext.get());
    
    // Restore if needed
    if (shouldSave) {
      _localContext->getCanvas()->restore();
    }
        
    // Mark container as done
    container->markAsResolved();
    
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
      auto declarationNode = std::dynamic_pointer_cast<JsiBaseDomDeclarationNode>(child);
      if (declarationNode != nullptr) {
        declarationNode->materializeNode(context);
      }
    }
  };
  
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
    
    container->defineProperty(std::make_shared<PaintProps>());
    
    _opacityProp = container->defineProperty(std::make_shared<NodeProp>(PropNameOpacity));
    _matrixProp = container->defineProperty(std::make_shared<MatrixProp>(PropNameMatrix));
    _transformProp = container->defineProperty(std::make_shared<TransformProp>(PropNameTransform));
    _originProp = container->defineProperty(std::make_shared<PointProp>(PropNameOrigin));
    _clipProp = container->defineProperty(std::make_shared<ClipProp>(PropNameClip));
    _invertClip = container->defineProperty(std::make_shared<NodeProp>(PropNameInvertClip));
    _layerProp = container->defineProperty(std::make_shared<NodeProp>(PropNameLayer));
  }
  
private:
  PointProp* _originProp;
  MatrixProp* _matrixProp;
  TransformProp* _transformProp;
  NodeProp* _opacityProp;
  NodeProp* _invertClip;
  ClipProp* _clipProp;
  NodeProp* _layerProp;
  
  std::shared_ptr<DrawingContext> _localContext;
};

}
