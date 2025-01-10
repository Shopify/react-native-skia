#pragma once

#include "include/core/SkSamplingOptions.h"

namespace RNSkia {

static PropId PropNameCubicB = JsiPropId::get("B");
static PropId PropNameCubicC = JsiPropId::get("C");
static PropId PropNameFilter = JsiPropId::get("filter");
static PropId PropNameMipmap = JsiPropId::get("mipmap");

class SamplingProp : public DerivedProp<SkSamplingOptions> {
public:
  explicit SamplingProp(PropId name,
                        const std::function<void(BaseNodeProp *)> &onChange)
      : DerivedProp(onChange) {
    _prop = defineProperty<NodeProp>(name);
  }

  static SkSamplingOptions processSamplingOptions(const JsiValue &value) {
    SkSamplingOptions samplingOptions(SkFilterMode::kLinear);
    if (value.getType() == PropType::Object) {
      if (value.hasValue(PropNameCubicB) && value.hasValue(PropNameCubicC)) {
        auto B =
            static_cast<float>(value.getValue(PropNameCubicB).getAsNumber());
        auto C =
            static_cast<float>(value.getValue(PropNameCubicC).getAsNumber());
        samplingOptions = SkSamplingOptions({B, C});
      } else if (value.hasValue(PropNameFilter)) {
        auto filter = static_cast<SkFilterMode>(
            value.getValue(PropNameFilter).getAsNumber());
        if (value.hasValue(PropNameMipmap)) {
          auto mipmap = static_cast<SkMipmapMode>(
              value.getValue(PropNameMipmap).getAsNumber());
          samplingOptions = SkSamplingOptions(filter, mipmap);
        } else {
          samplingOptions = SkSamplingOptions(filter);
        }
      }
    }

    return samplingOptions;
  }

  void updateDerivedValue() override {
    if (_prop->isSet()) {
      setDerivedValue(SamplingProp::processSamplingOptions(_prop->value()));
    }
  }

private:
  NodeProp *_prop;
};
} // namespace RNSkia
