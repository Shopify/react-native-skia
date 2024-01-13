#pragma once

#include "DerivedNodeProp.h"

#include <SkRect.h>
#include <SkRSXform.h>
#include <tuple>
#include <vector>

namespace RNSkia {

class AtlasProp : public DerivedProp<std::tuple<std::vector<SkRect>, std::vector<SkRSXform>>> {
public:
    explicit AtlasProp(PropId name,
                       const std::function<void(BaseNodeProp *)>& onChange)
        : DerivedProp<std::tuple<std::vector<SkRect>, std::vector<SkRSXform>>>(onChange) {
        _atlasProp = defineProperty<NodeProp>(name);
    }

    void updateDerivedValue() override {
        if (_atlasProp->value().getType() == PropType::Array) {
            auto arr = _atlasProp->value().getAsArray();
            std::vector<SkRect> rects;
            std::vector<SkRSXform> transforms;
            rects.reserve(arr.size());
            transforms.reserve(arr.size());

            for (const auto& item : arr) {
                auto rect = SkRect::MakeXYWH(
                    item.getValue(JsiPropId::get("rect")).getX(),
                    item.getValue(JsiPropId::get("rect")).getY(),
                    item.getValue(JsiPropId::get("rect")).getWidth(),
                    item.getValue(JsiPropId::get("rect")).getHeight()
                );
                rects.push_back(rect);

                auto transform = SkRSXform::Make(
                    item.getValue(JsiPropId::get("transform")).get("scos").getFloat(),
                    item.getValue(JsiPropId::get("transform")).get("ssin").getFloat(),
                    item.getValue(JsiPropId::get("transform")).get("tx").getFloat(),
                    item.getValue(JsiPropId::get("transform")).get("ty").getFloat()
                );
                transforms.push_back(transform);
            }

            setDerivedValue(std::make_tuple(std::move(rects), std::move(transforms)));
        }
    }

private:
    NodeProp* _atlasProp;
};

} // namespace RNSkia
