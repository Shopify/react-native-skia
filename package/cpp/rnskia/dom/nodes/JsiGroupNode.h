
#pragma once

#include "JsiDomRenderNode.h"

namespace RNSkia {

class JsiGroupNode :
public JsiDomRenderNode,
public JsiDomNodeCtor<JsiGroupNode> {
public:
  JsiGroupNode(std::shared_ptr<RNSkPlatformContext> context) :
    JsiDomRenderNode(context, "skGroup") {}
};

}
