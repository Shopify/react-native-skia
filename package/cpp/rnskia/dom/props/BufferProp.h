#pragma once

#include "NodeProp.h"
#include "DerivedNodeProp.h"

#include <memory>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkRect.h"

#pragma clang diagnostic pop

namespace RNSkia {

/**
 Reads a rect from a given propety in the node. The name of the property is
 provided on the constructor. The property can either be a Javascript property
 or a host object representing an SkRect.
 */
class BufferProp : public DerivedProp<const void*> {
public:
  explicit BufferProp(PropId name,
                    const std::function<void(BaseNodeProp *)> &onChange)
      : DerivedProp(onChange) {
    _prop = defineProperty<NodeProp>(name);
  }

  void updateDerivedValue() override {
    if (_prop->isSet()) {
      auto rptr = _prop->value().getAsBuffer();
      setDerivedValue(std::make_shared<const void*>(rptr));
    }
  }

private:
  NodeProp *_prop;
};

} // namespace RNSkia
