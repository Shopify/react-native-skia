#pragma once

#include "JsiHostObject.h"
#include "jsi.h"

#include "nodes/JsiRectNode.h"

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
    }
  };

}
