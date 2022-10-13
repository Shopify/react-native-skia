#pragma once

#define SKIA_DOM_DEBUG 1

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

#include "nodes/JsiPathEffectNodes.h"

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
      
      // Path effects
      installFunction("DashPathEffectNode", JsiDashPathEffectNode::createCtor(context));
      installFunction("DiscretePathEffectNode", JsiDiscretePathEffectNode::createCtor(context));
      installFunction("CornerPathEffectNode", JsiCornerPathEffectNode::createCtor(context));
      installFunction("Path1DPathEffectNode", JsiPath1DPathEffectNode::createCtor(context));
      installFunction("Path2DPathEffectNode", JsiPath2DPathEffectNode::createCtor(context));
      installFunction("Line2DPathEffectNode", JsiLine2DPathEffectNode::createCtor(context));
      installFunction("SumPathEffectNode", JsiSumPathEffectNode::createCtor(context));
      
      installFunction("FillNode", JsiFillNode::createCtor(context));
    }
  };

}
