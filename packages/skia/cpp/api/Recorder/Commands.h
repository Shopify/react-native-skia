#pragma once

#include <memory>
#include <optional>
#include <string>
#include <variant>
#include <vector>

#include "include/core/SkFont.h"
#include "include/core/SkMatrix.h"
#include "include/core/SkPaint.h"

#include "Data.h"

#include "JsiSkPath.h"

namespace RNSkia {

enum CommandType {
  // Context
  Group,
  SavePaint,
  RestorePaint,
  SaveCTM,
  RestoreCTM,
  PushColorFilter,
  PushBlurMaskFilter,
  PushImageFilter,
  PushPathEffect,
  PushShader,
  ComposeColorFilter,
  ComposeImageFilter,
  ComposePathEffect,
  MaterializePaint,
  SaveBackdropFilter,
  SaveLayer,
  RestorePaintDeclaration,
  // Drawing
  DrawBox,
  DrawImage,
  DrawCircle,
  DrawPaint,
  DrawPoints,
  DrawPath,
  DrawRect,
  DrawRRect,
  DrawOval,
  DrawLine,
  DrawPatch,
  DrawVertices,
  DrawDiffRect,
  DrawText,
  DrawTextPath,
  DrawTextBlob,
  DrawGlyphs,
  DrawPicture,
  DrawImageSVG,
  DrawParagraph,
  DrawAtlas,
};

class CommandBase {
public:
  virtual ~CommandBase() = default;
  virtual CommandType getType() const = 0;
};

template <CommandType T> class Command : public CommandBase {
public:
  explicit Command(CommandType runtimeType = T) : _type(runtimeType) {}
  CommandType getType() const override { return _type; }

private:
  CommandType _type;
};

class GroupCommand : public Command<CommandType::Group> {
public:
  std::vector<std::unique_ptr<CommandBase>> children;
};

class SaveCTMCommand : public Command<CommandType::SaveCTM> {
public:
  std::optional<SkMatrix> matrix;
  std::optional<std::variant<std::shared_ptr<SkRRect>, std::shared_ptr<SkRect>,
                             std::shared_ptr<SkPath>>>
      clipDef;
  std::optional<bool> invertClip;
  std::optional<std::variant<SkPaint, bool>> layer;

  void setCTM(SkCanvas *canvas) {
    // TODO: shouldSave is not necessary here
    auto shouldSave =
        matrix.has_value() || clipDef.has_value() || layer.has_value();
    if (shouldSave) {
      if (layer.has_value()) {
        if (std::holds_alternative<bool>(layer.value())) {
          canvas->saveLayer(
              SkCanvas::SaveLayerRec(nullptr, nullptr, nullptr, 0));
        } else {
          canvas->saveLayer(SkCanvas::SaveLayerRec(
              nullptr, &std::get<SkPaint>(layer.value()), nullptr, 0));
        }
      } else {
        canvas->save();
      }
    }
    if (matrix.has_value()) {
      canvas->concat(matrix.value());
    }
    if (clipDef.has_value()) {
      auto clipOp = invertClip ? SkClipOp::kDifference : SkClipOp::kIntersect;
      if (std::holds_alternative<std::shared_ptr<SkRRect>>(clipDef.value())) {
        auto rrect = std::get<std::shared_ptr<SkRRect>>(clipDef.value());
        canvas->clipRRect(*rrect, clipOp, true);
      } else if (std::holds_alternative<std::shared_ptr<SkRect>>(
                     clipDef.value())) {
        auto rect = std::get<std::shared_ptr<SkRect>>(clipDef.value());
        canvas->clipRect(*rect, clipOp, true);
      } else if (std::holds_alternative<std::shared_ptr<SkPath>>(
                     clipDef.value())) {
        auto path = std::get<std::shared_ptr<SkPath>>(clipDef.value());
        canvas->clipPath(*path, clipOp, true);
      }
    }
  }

  static std::unique_ptr<SaveCTMCommand>
  fromJSIObject(jsi::Runtime &runtime, const jsi::Object &object) {
    auto command = std::make_unique<SaveCTMCommand>();
    auto props = object.getProperty(runtime, "props").asObject(runtime);
    if (props.hasProperty(runtime, "invertClip")) {
      command->invertClip = props.getProperty(runtime, "invertClip").asBool();
    }
    if (props.hasProperty(runtime, "clip")) {
      auto clip = props.getProperty(runtime, "clip");
      auto path = processPath(runtime, clip);
      if (path) {
        command->clipDef = path;
      }
      auto rect = processRect(runtime, clip);
      if (rect) {
        command->clipDef = rect;
      }
      auto rrect = processRRect(runtime, clip);
      if (rrect) {
        command->clipDef = rrect;
      }
    }
    if (props.hasProperty(runtime, "matrix")) {
      SkMatrix m3;
      auto matrix =
          processMatrix(runtime, props.getProperty(runtime, "matrix"));
      if (props.hasProperty(runtime, "origin")) {
        auto origin =
            processPoint(runtime, props.getProperty(runtime, "origin"));
        m3.Translate(origin);
        m3.Concat(m3, matrix);
        m3.Translate(-origin);
      } else {
        m3.Concat(m3, matrix);
      }
      command->matrix = m3;
    } else if (props.hasProperty(runtime, "transform")) {

      SkMatrix m3;
      command->matrix = m3;
    }
    /*
export const processTransformProps2 = (Skia: Skia, props: TransformProps) => {
  "worklet";

  const { transform, origin, matrix } = props;
  if (matrix) {
    const m3 = Skia.Matrix();
    if (origin) {
      m3.translate(origin.x, origin.y);
      m3.concat(matrix);
      m3.translate(-origin.x, -origin.y);
    } else {
      m3.concat(matrix);
    }
    return m3;
  } else if (transform) {
    const m3 = Skia.Matrix();
    if (origin) {
      m3.translate(origin.x, origin.y);
    }
    processTransform(m3, transform);
    if (origin) {
      m3.translate(-origin.x, -origin.y);
    }
    return m3;
  }
  return null;
};

    */
    return command;
  }
};

class SavePaintCommand : public Command<CommandType::SavePaint> {
private:
  static SkPaint::Cap getCapFromString(const std::string &value) {
    if (value == "round") {
      return SkPaint::Cap::kRound_Cap;
    } else if (value == "butt") {
      return SkPaint::Cap::kButt_Cap;
    } else if (value == "square") {
      return SkPaint::Cap::kSquare_Cap;
    }
    throw std::runtime_error("Property value \"" + value +
                             "\" is not a legal stroke cap.");
  }

  static SkPaint::Join getJoinFromString(const std::string &value) {
    if (value == "miter") {
      return SkPaint::Join::kMiter_Join;
    } else if (value == "round") {
      return SkPaint::Join::kRound_Join;
    } else if (value == "bevel") {
      return SkPaint::Join::kBevel_Join;
    }
    throw std::runtime_error("Property value \"" + value +
                             "\" is not a legal stroke join.");
  }

  static SkBlendMode getBlendModeFromString(const std::string &value) {
    if (value == "clear") {
      return SkBlendMode::kClear;
    } else if (value == "src") {
      return SkBlendMode::kSrc;
    } else if (value == "dst") {
      return SkBlendMode::kDst;
    } else if (value == "srcOver") {
      return SkBlendMode::kSrcOver;
    } else if (value == "dstOver") {
      return SkBlendMode::kDstOver;
    } else if (value == "srcIn") {
      return SkBlendMode::kSrcIn;
    } else if (value == "dstIn") {
      return SkBlendMode::kDstIn;
    } else if (value == "srcOut") {
      return SkBlendMode::kSrcOut;
    } else if (value == "dstOut") {
      return SkBlendMode::kDstOut;
    } else if (value == "srcATop") {
      return SkBlendMode::kSrcATop;
    } else if (value == "dstATop") {
      return SkBlendMode::kDstATop;
    } else if (value == "xor") {
      return SkBlendMode::kXor;
    } else if (value == "plus") {
      return SkBlendMode::kPlus;
    } else if (value == "modulate") {
      return SkBlendMode::kModulate;
    } else if (value == "screen") {
      return SkBlendMode::kScreen;
    } else if (value == "overlay") {
      return SkBlendMode::kOverlay;
    } else if (value == "darken") {
      return SkBlendMode::kDarken;
    } else if (value == "lighten") {
      return SkBlendMode::kLighten;
    } else if (value == "colorDodge") {
      return SkBlendMode::kColorDodge;
    } else if (value == "colorBurn") {
      return SkBlendMode::kColorBurn;
    } else if (value == "hardLight") {
      return SkBlendMode::kHardLight;
    } else if (value == "softLight") {
      return SkBlendMode::kSoftLight;
    } else if (value == "difference") {
      return SkBlendMode::kDifference;
    } else if (value == "exclusion") {
      return SkBlendMode::kExclusion;
    } else if (value == "multiply") {
      return SkBlendMode::kMultiply;
    } else if (value == "hue") {
      return SkBlendMode::kHue;
    } else if (value == "saturation") {
      return SkBlendMode::kSaturation;
    } else if (value == "color") {
      return SkBlendMode::kColor;
    } else if (value == "luminosity") {
      return SkBlendMode::kLuminosity;
    }

    throw std::runtime_error("Property value \"" + value +
                             "\" is not a legal blend mode.");
  }

public:
  std::optional<SkPaint> paint;
  std::optional<SkColor> color;
  std::optional<double> strokeWidth;
  std::optional<SkBlendMode> blendMode;
  std::optional<SkPaint::Style> style;
  std::optional<SkPaint::Join> strokeJoin;
  std::optional<SkPaint::Cap> strokeCap;
  std::optional<double> strokeMiter;
  std::optional<double> opacity;
  std::optional<bool> antiAlias;
  std::optional<bool> dither;

  void setProperties(SkPaint &paint) {
    if (opacity.has_value()) {
      paint.setAlphaf(paint.getAlphaf() * opacity.value());
    }
    if (color.has_value()) {
      auto currentOpacity = paint.getAlphaf();
      paint.setShader(nullptr);
      paint.setColor(color.value());
      paint.setAlphaf(currentOpacity * paint.getAlphaf());
    }
    if (blendMode.has_value()) {
      paint.setBlendMode(blendMode.value());
    }
    if (strokeWidth.has_value()) {
      paint.setStrokeWidth(strokeWidth.value());
    }
    if (style.has_value()) {
      paint.setStyle(style.value());
    }
    if (strokeJoin.has_value()) {
      paint.setStrokeJoin(strokeJoin.value());
    }
    if (strokeCap.has_value()) {
      paint.setStrokeCap(strokeCap.value());
    }
    if (strokeMiter.has_value()) {
      paint.setStrokeMiter(strokeMiter.value());
    }
    if (antiAlias.has_value()) {
      paint.setAntiAlias(antiAlias.value());
    }
    if (dither.has_value()) {
      paint.setDither(dither.value());
    }
  }

  static std::unique_ptr<SavePaintCommand>
  fromJSIObject(jsi::Runtime &runtime, const jsi::Object &object) {
    auto command = std::make_unique<SavePaintCommand>();
    auto props = object.getProperty(runtime, "props").asObject(runtime);
    if (props.hasProperty(runtime, "color")) {
      auto cl = props.getProperty(runtime, "color");
      if (cl.isObject()) {
        auto colorObj = cl.asObject(runtime);
        auto r = colorObj.getProperty(runtime, "0").asNumber();
        auto g = colorObj.getProperty(runtime, "1").asNumber();
        auto b = colorObj.getProperty(runtime, "2").asNumber();
        auto a = colorObj.getProperty(runtime, "3").asNumber();
        command->color =
            SkColorSetARGB(a * 255.0f, r * 255.0f, g * 255.0f, b * 255.0f);
      } else if (cl.isNumber()) {
        command->color = static_cast<SkColor>(cl.asNumber());
      } else if (cl.isString()) {
        auto parsedColor =
            CSSColorParser::parse(cl.asString(runtime).utf8(runtime));
        if (parsedColor.a == -1.0f) {
          command->color = SK_ColorBLACK;
        } else {
          command->color = SkColorSetARGB(parsedColor.a * 255, parsedColor.r,
                                          parsedColor.g, parsedColor.b);
        }
      }
    }
    if (props.hasProperty(runtime, "opacity")) {
      auto opacity = props.getProperty(runtime, "opacity").asNumber();
      command->opacity = opacity;
    }
    if (props.hasProperty(runtime, "blendMode")) {
      auto blendMode = props.getProperty(runtime, "blendMode")
                           .asString(runtime)
                           .utf8(runtime);
      command->blendMode = getBlendModeFromString(blendMode);
    }
    if (props.hasProperty(runtime, "strokeWidth")) {
      command->strokeWidth =
          props.getProperty(runtime, "strokeWidth").asNumber();
    }
    if (props.hasProperty(runtime, "style")) {
      auto style =
          props.getProperty(runtime, "style").asString(runtime).utf8(runtime);
      command->style = style == "fill" ? SkPaint::Style::kFill_Style
                                       : SkPaint::Style::kStroke_Style;
    }
    if (props.hasProperty(runtime, "strokeJoin")) {
      auto join = props.getProperty(runtime, "strokeJoin")
                      .asString(runtime)
                      .utf8(runtime);
      command->strokeJoin = getJoinFromString(join);
    }
    if (props.hasProperty(runtime, "strokeCap")) {
      auto cap = props.getProperty(runtime, "strokeCap")
                     .asString(runtime)
                     .utf8(runtime);
      command->strokeCap = getCapFromString(cap);
    }
    if (props.hasProperty(runtime, "strokeMiter")) {
      command->strokeMiter =
          props.getProperty(runtime, "strokeMiter").asNumber();
    }
    if (props.hasProperty(runtime, "antiAlias")) {
      command->antiAlias = props.getProperty(runtime, "antiAlias").asBool();
    }
    if (props.hasProperty(runtime, "dither")) {
      command->dither = props.getProperty(runtime, "dither").asBool();
    }
    return command;
  }
};

} // namespace RNSkia
