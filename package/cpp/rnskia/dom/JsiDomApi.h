#pragma once

#include "JsiHostObject.h"

#include "nodes/JsiRectNode.h"
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
      installFunction("GroupNode", JsiGroupNode::createCtor(context));
    }
  };

}
