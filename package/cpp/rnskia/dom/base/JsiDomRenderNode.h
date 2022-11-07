
#pragma once

#include "ClipProp.h"
#include "DrawingContext.h"
#include "JsiDomDeclarationNode.h"
#include "JsiDomNode.h"
#include "LayerProp.h"
#include "MatrixProp.h"
#include "PaintProps.h"
#include "PointProp.h"
#include "RRectProp.h"
#include "RectProp.h"
#include "TransformProp.h"

#include <memory>
#include <string>

namespace RNSkia {

static PropId PropNameOrigin = JsiPropId::get("origin");
static PropId PropNameOpacity = JsiPropId::get("opacity");
static PropId PropNameClip = JsiPropId::get("clip");
static PropId PropNameInvertClip = JsiPropId::get("invertClip");
static PropId PropNameLayer = JsiPropId::get("layer");

class JsiDomRenderNode : public JsiDomNode {
public:
  JsiDomRenderNode(std::shared_ptr<RNSkPlatformContext> context,
                   const char *type)
      : JsiDomNode(context, type) {}

  void render(DrawingContext *context) {
#if SKIA_DOM_DEBUG
    printDebugInfo(context, "Begin Render");
#endif

    // Ensure property changes has been registered
    updatePendingProperties();

    // Ensure we have a local drawing context inheriting from the parent context
    if (_localContext == nullptr) {
      _localContext = context->inheritContext(getType());
    }

    auto shouldTransform = _matrixProp->isSet() || _transformProp->isSet();
    auto shouldSave =
        shouldTransform || _clipProp->isSet() || _layerProp->isSet();

    // Handle matrix/transforms
    if (shouldSave) {
      // Save canvas state
      if (_layerProp->isSet()) {
        if (_layerProp->isBool()) {
#if SKIA_DOM_DEBUG
          printDebugInfo(context, "canvas->saveLayer()");
#endif
          _localContext->getCanvas()->saveLayer(
              SkCanvas::SaveLayerRec(nullptr, nullptr, nullptr, 0));
        } else {
#if SKIA_DOM_DEBUG
          printDebugInfo(context, "canvas->saveLayer(paint)");
#endif
          _localContext->getCanvas()->saveLayer(SkCanvas::SaveLayerRec(
              nullptr, _layerProp->getDerivedValue().get(), nullptr, 0));
        }
      } else {
#if SKIA_DOM_DEBUG
        printDebugInfo(context, "canvas->save()");
#endif
        _localContext->getCanvas()->save();
      }

      if (_originProp->isSet()) {
#if SKIA_DOM_DEBUG
        printDebugInfo(context, "canvas->translate(origin)");
#endif
        // Handle origin
        _localContext->getCanvas()->translate(
            _originProp->getDerivedValue()->x(),
            _originProp->getDerivedValue()->y());
      }

      if (shouldTransform) {
#if SKIA_DOM_DEBUG
        printDebugInfo(
            context,
            "canvas->concat(" +
                std::string(_matrixProp->isSet() ? "matrix" : "transform") +
                std::string(")"));
#endif
        auto matrix = _matrixProp->isSet() ? _matrixProp->getDerivedValue()
                                           : _transformProp->getDerivedValue();

        // Concat canvas' matrix with our matrix
        _localContext->getCanvas()->concat(*matrix);
      }

      // Clipping
      if (_clipProp->isSet()) {
        auto invert = _invertClip->isSet() && _invertClip->value()->getAsBool();
        clip(context, _localContext->getCanvas(), invert);
      }

      if (_originProp->isSet()) {
#if SKIA_DOM_DEBUG
        printDebugInfo(context, "canvas->translate(-origin)");
#endif
        // Handle origin
        _localContext->getCanvas()->translate(
            -_originProp->getDerivedValue()->x(),
            -_originProp->getDerivedValue()->y());
      }
    }

    // Let any local paint props decorate the context
    _paintProps->materialize(_localContext.get());

    // Now let's make sure the local context is resolved correctly - ie. that
    // all children of type declaration (except paint) is given the opportunity
    // to decorate the context.
    materializeDeclarations();

    // Render the node
    renderNode(_localContext.get());

    // Restore if needed
    if (shouldSave) {
#if SKIA_DOM_DEBUG
      printDebugInfo(context, "canvas->restore()");
#endif
      _localContext->getCanvas()->restore();
    }

    // Resolve changes
    markPropertiesAsResolved();
    _localContext->markAsValidated();

#if SKIA_DOM_DEBUG
    printDebugInfo(context, "End Render");
#endif
  }

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
   Override to implement rendering where the current state of the drawing
   context is correctly set.
   */
  virtual void renderNode(DrawingContext *context) = 0;

  /**
   Removes a child
   */
  void removeChild(std::shared_ptr<JsiDomNode> child) override {
    JsiDomNode::removeChild(child);
    if (_localContext != nullptr) {
      _localContext->invalidate();
    }
  }

  /**
   Validates that only declaration nodes can be children
   */
  void addChild(std::shared_ptr<JsiDomNode> child) override {
    JsiDomNode::addChild(child);
    if (_localContext != nullptr) {
      _localContext->invalidate();
    }
  }

  /**
   Validates that only declaration nodes can be children
   */
  void insertChildBefore(std::shared_ptr<JsiDomNode> child,
                         std::shared_ptr<JsiDomNode> before) override {
    JsiDomNode::insertChildBefore(child, before);
    if (_localContext != nullptr) {
      _localContext->invalidate();
    }
  }

  /**
   Define common properties for all render nodes
   */
  void defineProperties(NodePropsContainer *container) override {
    JsiDomNode::defineProperties(container);

    _paintProps = container->defineProperty(std::make_shared<PaintProps>());

    _matrixProp =
        container->defineProperty(std::make_shared<MatrixProp>(PropNameMatrix));
    _transformProp = container->defineProperty(
        std::make_shared<TransformProp>(PropNameTransform));
    _originProp =
        container->defineProperty(std::make_shared<PointProp>(PropNameOrigin));
    _clipProp =
        container->defineProperty(std::make_shared<ClipProp>(PropNameClip));
    _invertClip = container->defineProperty(
        std::make_shared<NodeProp>(PropNameInvertClip));
    _layerProp =
        container->defineProperty(std::make_shared<LayerProp>(PropNameLayer));
  }

private:
  /**
   Clips the canvas depending on the clip property
   */
  void clip(DrawingContext *context, SkCanvas *canvas, bool invert) {
    auto op = invert ? SkClipOp::kDifference : SkClipOp::kIntersect;
    if (_clipProp->getRect() != nullptr) {
#if SKIA_DOM_DEBUG
      printDebugInfo(context, "canvas->clipRect()");
#endif
      canvas->clipRect(*_clipProp->getRect(), op, true);
    } else if (_clipProp->getRRect() != nullptr) {
#if SKIA_DOM_DEBUG
      printDebugInfo(context, "canvas->clipRRect()");
#endif
      canvas->clipRRect(*_clipProp->getRRect(), op, true);
    } else if (_clipProp->getPath() != nullptr) {
#if SKIA_DOM_DEBUG
      printDebugInfo(context, "canvas->clipPath()");
#endif
      canvas->clipPath(*_clipProp->getPath(), op, true);
    }
  }

  /**
   Loops through all declaration nodes and gives each one of them the
   opportunity to decorate the context
   */
  void materializeDeclarations() {
    for (auto &child : getChildren()) {
      auto ptr = std::dynamic_pointer_cast<JsiBaseDomDeclarationNode>(child);
      if (ptr != nullptr) {
        ptr->materializeNode(_localContext.get());
      }
    }
  }

  PointProp *_originProp;
  MatrixProp *_matrixProp;
  TransformProp *_transformProp;
  NodeProp *_invertClip;
  ClipProp *_clipProp;
  LayerProp *_layerProp;
  PaintProps *_paintProps;

  std::shared_ptr<DrawingContext> _localContext;
};

} // namespace RNSkia
