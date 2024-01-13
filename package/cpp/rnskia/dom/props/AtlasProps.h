#pragma once

#include "DerivedNodeProp.h"
#include "RectProp.h"

#include <SkRSXform.h>
#include <SkRect.h>
#include <tuple>
#include <vector>

namespace RNSkia {

class AtlasProp : public DerivedProp<
                      std::tuple<std::vector<SkRect>, std::vector<SkRSXform>>> {
public:
  explicit AtlasProp(PropId name,
                     const std::function<void(BaseNodeProp *)> &onChange)
      : DerivedProp<std::tuple<std::vector<SkRect>, std::vector<SkRSXform>>>(
            onChange) {
    _atlasProp = defineProperty<NodeProp>(name);
  }

  void updateDerivedValue() override {
    if (_atlasProp->value().getType() == PropType::Array) {
      auto arr = _atlasProp->value().getAsArray();
      std::vector<SkRect> rects;
      std::vector<SkRSXform> transforms;
      rects.reserve(arr.size());
      transforms.reserve(arr.size());

      for (const auto &item : arr) {
        auto rectVal = item.getValue(JsiPropId::get("rect"));
        if (!rectVal.isUndefined()) {
          auto rect = RectProp::processRect(rectVal);
          rects.push_back(*rect);
        } else {
          rects.push_back(SkRect::MakeEmpty());
        }

        auto transformVal = item.getValue(JsiPropId::get("transform"));
        if (!transformVal.isUndefined()) {
          if (transformVal.getType() == PropType::HostObject) {
            auto rsxPtr = std::dynamic_pointer_cast<JsiSkRSXform>(
                transformVal.getAsHostObject());
            if (rsxPtr != nullptr) {
              auto rsx = SkRSXform::Make(
                  rsxPtr->getObject()->fSCos, rsxPtr->getObject()->fSSin,
                  rsxPtr->getObject()->fTx, rsxPtr->getObject()->fTy);
              transforms.push_back(rsx);
            }
          } else {
            auto tr = item.getValue(JsiPropId::get("transform"));
            auto transform = SkRSXform::Make(tr.getValue("scos").getAsNumber(),
                                             tr.getValue("ssin").getAsNumber(),
                                             tr.getValue("tx").getAsNumber(),
                                             tr.getValue("ty").getAsNumber());
            transforms.push_back(transform);
          }
        } else {
          transforms.push_back(SkRSXform::Make(1, 0, 0, 0));
        }
      }
      setDerivedValue(std::make_tuple(std::move(rects), std::move(transforms)));
    }
  }

private:
  NodeProp *_atlasProp;
};

} // namespace RNSkia
