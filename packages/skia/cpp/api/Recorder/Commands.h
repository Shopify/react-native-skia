#pragma once

#include <memory>
#include <optional>
#include <string>
#include <variant>
#include <vector>

#include "include/core/SkFont.h"
#include "include/core/SkMatrix.h"
#include "include/core/SkPaint.h"

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

class CTMCommand : public Command<CommandType::SaveCTM> {
public:
  std::optional<SkMatrix> matrix;
  std::optional<std::variant<SkRRect, SkRect, SkPath>> clipDef;
  std::optional<bool> invertClip;
  std::optional<std::variant<SkPaint, bool>> layer;
};

class SavePaintCommand : public Command<CommandType::SavePaint> {
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
        command->color = SkColorSetARGB(a * 255.0f, r * 255.0f, g * 255.0f, b * 255.0f);
      } else if (cl.isNumber()) {
        command->color = static_cast<SkColor>(cl.asNumber());
      } else if (cl.isString()) {
        auto parsedColor = CSSColorParser::parse(cl.asString(runtime).utf8(runtime));
        if (parsedColor.a == -1.0f) {
          command->color = SK_ColorBLACK;
        } else {
          command->color = SkColorSetARGB(parsedColor.a * 255, parsedColor.r, parsedColor.g, parsedColor.b);
        }
      }
    }
    return command;
  }
};


} // namespace RNSkia
