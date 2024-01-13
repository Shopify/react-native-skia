#pragma once

#include "DerivedNodeProp.h"
#include "RectProp.h"

#include <SkRSXform.h>
#include <SkRect.h>
#include <tuple>
#include <vector>

namespace RNSkia {

static PropId AtlasPropRect = JsiPropId::get("rect");
static PropId AtlasPropTransform = JsiPropId::get("transform");
// TODO: investigate if this can be factorize with TextPathBlob
static PropId Scos = JsiPropId::get("scos");
static PropId Ssin = JsiPropId::get("ssin");
static PropId Tx = JsiPropId::get("tx");
static PropId Ty = JsiPropId::get("ty");

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
        if (item.hasValue(AtlasPropRect)) {
          auto rectVal = item.getValue(AtlasPropRect);
          if (!rectVal.isUndefined()) {
            auto rect = RectProp::processRect(rectVal);
            rects.push_back(*rect);
          } else {
            rects.push_back(SkRect::MakeEmpty());
          }
        } else {
          rects.push_back(SkRect::MakeEmpty());
        }
        if (item.hasValue(AtlasPropTransform)) {
          auto transformVal = item.getValue(AtlasPropTransform);
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
            } else if (transformVal.getType() == PropType::Object &&
                       transformVal.hasValue(Scos) &&
                       transformVal.hasValue(Ssin) &&
                       transformVal.hasValue(Tx) && transformVal.hasValue(Ty)) {
              auto scos = transformVal.getValue(Scos).getAsNumber();
              auto ssin = transformVal.getValue(Ssin).getAsNumber();
              auto tx = transformVal.getValue(Tx).getAsNumber();
              auto ty = transformVal.getValue(Ty).getAsNumber();
              auto transform = SkRSXform::Make(scos, ssin, tx, ty);
              transforms.push_back(transform);
			} else {
				// TODO: throw an error here
				transforms.push_back(SkRSXform::Make(1, 0, 0, 0));
			}
          } else {
            transforms.push_back(SkRSXform::Make(1, 0, 0, 0));
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
