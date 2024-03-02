#pragma once

#include "JsiSkRSXform.h"
#include "NodeProp.h"

#include <memory>
#include <utility>
#include <vector>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkRSXform.h"

#pragma clang diagnostic pop

namespace RNSkia {

// TODO: Factorize these array classes
class RSXFormsProp : public DerivedProp<std::vector<SkRSXform>> {
public:
  explicit RSXFormsProp(PropId name,
                        const std::function<void(BaseNodeProp *)> &onChange)
      : DerivedProp<std::vector<SkRSXform>>(onChange) {
    _rsxFormsProp = defineProperty<NodeProp>(name);
  }

  void updateDerivedValue() override {
    if (_rsxFormsProp->isSet()) {
      auto rsxforms = _rsxFormsProp->value().getAsArray();
      std::vector<SkRSXform> derivedRSXForms;
      derivedRSXForms.reserve(rsxforms.size());

      for (size_t i = 0; i < rsxforms.size(); ++i) {
        auto val = rsxforms[i];
        if (val.getType() == PropType::HostObject) {
          auto rsx =
              std::dynamic_pointer_cast<JsiSkRSXform>(val.getAsHostObject())
                  ->getObject();
          derivedRSXForms.push_back(*rsx);
        }
      }
      setDerivedValue(std::move(derivedRSXForms));
    } else {
      setDerivedValue(nullptr);
    }
  }

private:
  NodeProp *_rsxFormsProp;
};
} // namespace RNSkia
