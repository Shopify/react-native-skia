#pragma once

#include <optional>
#include <string>
#include <variant>

#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"

namespace RNSkia {

struct PaintCmdProps {
  std::optional<SkColor> color;
  std::optional<SkBlendMode> blendMode;
  /*
    color?: Color;
  strokeWidth?: number;
  blendMode?: SkEnum<typeof BlendMode>;
  style?: SkEnum<typeof PaintStyle>;
  strokeJoin?: SkEnum<typeof StrokeJoin>;
  strokeCap?: SkEnum<typeof StrokeCap>;
  strokeMiter?: number;
  opacity?: number;
  antiAlias?: boolean;
  dither?: boolean;
  */
};

class SavePaintCmd : public Command {
private:
  PaintCmdProps props;

public:
  SavePaintCmd(jsi::Runtime &runtime, const jsi::Object &object,
               Variables &variables)
      : Command(CommandType::SavePaint) {
    convertProperty(runtime, object, "color", props.color, variables);
    convertProperty(runtime, object, "blendMode", props.blendMode, variables);
  }

  void savePaint(DrawingCtx *ctx) {
    auto &paint = ctx->getPaint();
    if (props.color.has_value()) {
      paint.setColor(props.color.value());
    }
    if (props.blendMode.has_value()) {
      paint.setBlendMode(props.blendMode.value());
    }
  }
};

} // namespace RNSkia
