#pragma once

#include <optional>

#include "Convertor.h"

namespace RNSkia {

struct CircleCmdProps {
  std::optional<float> cx;
  std::optional<float> cy;
  std::optional<SkPoint> c;
  float r;
};

void convert(jsi::Runtime& runtime, const jsi::Object& object,
            CircleCmdProps& props, Variables& variables) {
    convertProperty<float>(runtime, object, "cx", props.cx, variables);
    convertProperty<float>(runtime, object, "cy", props.cy, variables);
    convertProperty<SkPoint>(runtime, object, "c", props.c, variables);
    convertProperty<float>(runtime, object, "r", props.r, variables);
}

} // namespace RNSkia