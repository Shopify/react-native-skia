#pragma once

#include "JsiHostObject.h"

#include "nodes/JsiRectNode.h"
#include "nodes/JsiRRectNode.h"
#include "nodes/JsiGroupNode.h"

namespace RNSkia
{

  using namespace facebook;

  class JsiDomApi : public JsiHostObject
  {
  public:
    JsiDomApi(std::shared_ptr<RNSkPlatformContext> context)
        : JsiHostObject()
    {
      installFunction("RectNode", JsiRectNode::createCtor(context));
      installFunction("RRectNode", JsiRRectNode::createCtor(context));
      installFunction("GroupNode", JsiGroupNode::createCtor(context));
    }
  };

}
