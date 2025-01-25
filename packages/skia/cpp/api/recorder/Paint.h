#pragma once

#include <optional>
#include <string>
#include <variant>

#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"

namespace RNSkia {

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
    convertProperty(runtime, object, "clip", props.clip, variables);
    convertProperty(runtime, object, "invertClip", props.invertClip, variables);
    convertProperty(runtime, object, "layer", props.layer, variables);
  }

  void saveCTM(DrawingCtx *ctx) {
    auto [transform, origin, matrix, clip, invertClip, layer] = props;
    auto hasTransform = matrix.has_value() || transform.has_value();
    auto hasClip = clip.has_value();
    auto op = invertClip.has_value() && invertClip.value()
                  ? SkClipOp::kDifference
                  : SkClipOp::kIntersect;
    auto shouldSave = hasTransform || hasClip || layer.has_value();
    SkMatrix m3;
    if (matrix.has_value()) {
      if (origin.has_value()) {
        m3.preTranslate(origin.value().x(), origin.value().y());
        m3.preConcat(matrix.value());
        m3.preTranslate(-origin.value().x(), -origin.value().y());
      } else {
        m3.preConcat(props.matrix.value());
      }
    } else if (transform.has_value()) {
      SkM44 m4;
      auto tm4 = transform.value();
      if (origin.has_value()) {
        m4.preTranslate(origin.value().x(), origin.value().y());
        m4.preConcat(tm4);
        m4.preTranslate(-origin.value().x(), -origin.value().y());
      } else {
        m4.preConcat(tm4);
      }
      m3 = m4.asM33();
    }
    if (shouldSave) {
      if (layer.has_value()) {
        if (std::holds_alternative<bool>(layer.value())) {
          ctx->canvas->saveLayer(nullptr, nullptr);
        } else {
          auto paint = std::get<SkPaint>(layer.value());
          ctx->canvas->saveLayer(nullptr, &paint);
        }
      } else {
        ctx->canvas->save();
      }
      ctx->canvas->concat(m3);
    }
    /*

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
