#pragma once

#include "JsiDrawingContext.h"
#include "PaintProcessor.h"

namespace RNSkia {

static std::string PropNameOpacity = "opacity";

class ContextProcessor {
public:
  /**
   Processes a drawing context. A drawing context taktes the parent context and resolves any overridden properties returning
   either the same parent context or a new child context when props have changed that affects the context.
   */
  static std::shared_ptr<JsiBaseDrawingContext> processContext(std::shared_ptr<JsiBaseDrawingContext> context,
                                                               std::shared_ptr<SkPaint> paintCache,
                                                               std::shared_ptr<JsiDomNodeProps> props) {
    
    double opacity = context->getOpacity();
    if (props->hasValue(PropNameOpacity)) {
      opacity = props->getValue(PropNameOpacity)->getAsNumber();
      opacity *= context->getOpacity();
    }
        
    auto paint = PaintProcessor::processPaint(context->getPaint(), paintCache, props, opacity);
    
    return std::make_shared<JsiDrawingContext>(context, paint, opacity);
  }
};

}
