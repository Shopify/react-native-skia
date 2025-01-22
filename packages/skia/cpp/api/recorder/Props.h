#pragma once

#include <optional>
#include <variant>

#include <include/core/SkPoint.h>
#include <include/core/SkPaint.h>

namespace RNSkia {

struct CircleCmdProps {
  std::optional<float> cx;
  std::optional<float> cy;
  std::optional<SkPoint> c;
  float r;
};

struct PaintCmdProps {
  std::optional<SkColor> color;
  std::optional<float> strokeWidth;
  std::optional<SkBlendMode> blendMode;
  std::optional<SkPaint::Style> style;
  std::optional<SkPaint::Join> strokeJoin;
  std::optional<SkPaint::Cap> strokeCap;
  std::optional<float> strokeMiter;
  std::optional<float> opacity;
  std::optional<bool> antiAlias;
  std::optional<bool> dither;
};

} // namespace RNSkia