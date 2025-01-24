#pragma once

#include <optional>
#include <string>
#include <variant>

#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"

namespace RNSkia {

using ClipDef = std::variant<SkPath, SkRRect, SkRect>;
using Layer = std::variant<SkPaint, bool>;

struct CTMCmdProps {
  std::optional<SkM44> transform;
  std::optional<SkPoint> origin;
  std::optional<SkMatrix> matrix;
  std::optional<ClipDef> clip;
  std::optional<bool> invertClip;
  std::optional<Layer> layer;
};

class SaveCTMCmd : public Command {
private:
  CTMCmdProps props;

public:
  SaveCTMCmd(jsi::Runtime &runtime, const jsi::Object &object,
             Variables &variables)
      : Command(CommandType::SaveCTM) {
    convertProperty(runtime, object, "transform", props.transform, variables);
    convertProperty(runtime, object, "origin", props.origin, variables);
    convertProperty(runtime, object, "matrix", props.matrix, variables);
    // convertProperty(runtime, object, "clip", props.clip, variables);
    // convertProperty(runtime, object, "invertClip", props.invertClip,
    // variables); convertProperty(runtime, object, "layer", props.layer,
    // variables);
  }

  void saveCTM(DrawingCtx *ctx) {
    auto hasTransform = props.matrix.has_value() || props.transform.has_value();
    auto hasClip = props.clip.has_value();
    auto op = props.invertClip.has_value() && props.invertClip.value()
                  ? SkClipOp::kDifference
                  : SkClipOp::kIntersect;
    /*
    const hasTransform = matrix !== undefined || transform !== undefined;
  const clip = computeClip(Skia, rawClip);
  const hasClip = clip !== undefined;
  const op = invertClip ? ClipOp.Difference : ClipOp.Intersect;
  const m3 = processTransformProps2(Skia, { matrix, transform, origin });
  const shouldSave = hasTransform || hasClip || !!layer;
  if (shouldSave) {
    if (layer) {
      if (typeof layer === "boolean") {
        canvas.saveLayer();
      } else {
        canvas.saveLayer(layer);
      }
    } else {
      canvas.save();
    }
  }
  if (m3) {
    canvas.concat(m3);
  }
  if (clip) {
    if ("clipRect" in clip) {
      canvas.clipRect(clip.clipRect, op, true);
    } else if ("clipRRect" in clip) {
      canvas.clipRRect(clip.clipRRect, op, true);
    } else {
      canvas.clipPath(clip.clipPath, op, true);
    }
  }
    */
  }
};

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
    ctx->savePaint();
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
