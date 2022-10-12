#pragma once

#include "JsiHostObject.h"

#include "base/JsiDependencyManager.h"

#include "nodes/JsiRectNode.h"
#include "nodes/JsiRRectNode.h"
#include "nodes/JsiCircleNode.h"
#include "nodes/JsiGroupNode.h"
#include "nodes/JsiFillNode.h"
#include "nodes/JsiPathNode.h"
#include "nodes/JsiLineNode.h"
#include "nodes/JsiImageNode.h"
#include "nodes/JsiOvalNode.h"
#include "nodes/JsiPointsNode.h"
#include "nodes/JsiDiffRectNode.h"

#include "nodes/JsiBlurMaskNode.h"

#include "nodes/JsiPaintNode.h"

namespace RNSkia
{

  using namespace facebook;

  class JsiDomApi : public JsiHostObject
  {
  public:
    JsiDomApi(std::shared_ptr<RNSkPlatformContext> context)
        : JsiHostObject()
    {
      installFunction("DependencyManager", JsiDependencyManager::createCtor(context));
      
      installFunction("RectNode", JsiRectNode::createCtor(context));
      installFunction("RRectNode", JsiRRectNode::createCtor(context));
      installFunction("CircleNode", JsiCircleNode::createCtor(context));
      installFunction("PathNode", JsiPathNode::createCtor(context));
      installFunction("LineNode", JsiLineNode::createCtor(context));
      installFunction("ImageNode", JsiImageNode::createCtor(context));
      installFunction("OvalNode", JsiOvalNode::createCtor(context));
      installFunction("PointsNode", JsiPointsNode::createCtor(context));
      installFunction("DiffRectNode", JsiDiffRectNode::createCtor(context));

      installFunction("GroupNode", JsiGroupNode::createCtor(context));
      
      installFunction("PaintNode", JsiPaintNode::createCtor(context));
      
      installFunction("BlurMaskFilterNode", JsiBlurMaskNode::createCtor(context));
      
      installFunction("FillNode", JsiFillNode::createCtor(context));
    }
  };

}
