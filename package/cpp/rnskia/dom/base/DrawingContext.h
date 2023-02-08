#pragma once

#include "JsiHostObject.h"

#include "Declaration.h"
#include "DeclarationContext.h"

#include <memory>
#include <string>
#include <utility>
#include <vector>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkCanvas.h>
#include <SkPaint.h>
#include <SkRefCnt.h>

#pragma clang diagnostic pop

namespace RNSkia {

class PaintProps;
class JsiDomNode;

class DrawingContext : public std::enable_shared_from_this<DrawingContext> {
public:
  /**
   Creates a root drawing context with paint and opacity
   */
  DrawingContext();

  /**
   Creates a drawing context with the given paint as its starting paint object
  */
  explicit DrawingContext(std::shared_ptr<SkPaint> paint);

  /**
   Factory for saving/restoring the context for a node
   */
  bool saveAndConcat(PaintProps *paintProps,
                     const std::vector<std::shared_ptr<JsiDomNode>> &children,
                     std::shared_ptr<SkPaint> paintCache);
  void restore();

  /**
   Dispose and remove the drawing context from its parent.
   */
  void dispose();

  /**
   Returns true if the current cache is changed
   */
  bool isChanged();

  /**
   Get/Sets the canvas object
   */
  SkCanvas *getCanvas();

  /**
   Sets the canvas
   */
  void setCanvas(SkCanvas *canvas);

  /**
   Gets the paint object
   */
  std::shared_ptr<SkPaint> getPaint();

  float getScaledWidth();

  float getScaledHeight();

  void setScaledWidth(float v);
  void setScaledHeight(float v);

  void setRequestRedraw(std::function<void()> &&requestRedraw);
  const std::function<void()> &getRequestRedraw();

  /*
   Returns the root declaratiins object
   */
  DeclarationContext *getDeclarationContext() {
    return _declarationContext.get();
  }

private:
  void save();

  explicit DrawingContext(const char *source);

  SkCanvas *_canvas = nullptr;

  std::vector<std::shared_ptr<SkPaint>> _paints;

  float _scaledWidth = -1;
  float _scaledHeight = -1;
  std::function<void()> _requestRedraw;

  std::unique_ptr<DeclarationContext> _declarationContext;
};

} // namespace RNSkia
