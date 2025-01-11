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
    if (color.has_value()) {
      paint.setColor(color.value());
    }
  }
};

class DrawTextCommand : public Command<CommandType::DrawText> {
public:
  double _x;
  double _y;
  std::string _text;
  std::shared_ptr<SkFont> _font;
};

class DrawCircleCommand : public Command<CommandType::DrawCircle> {
public:
  float cx;
  float cy;
  float r;

  void draw(SkCanvas *canvas, SkPaint &paint) {
    canvas->drawCircle(cx, cy, r, paint);
  }

  static std::unique_ptr<DrawCircleCommand>
  fromJSIObject(jsi::Runtime &runtime, const jsi::Object &object) {
    auto command = std::make_unique<DrawCircleCommand>();
    auto props = object.getProperty(runtime, "props").asObject(runtime);

    if (props.hasProperty(runtime, "c")) {
      auto c = props.getProperty(runtime, "c").asObject(runtime);
      command->cx = c.getProperty(runtime, "x").asNumber();
      command->cy = c.getProperty(runtime, "y").asNumber();
    } else {
      command->cx =
          static_cast<float>(props.getProperty(runtime, "cx").asNumber());
      command->cy =
          static_cast<float>(props.getProperty(runtime, "cy").asNumber());
    }
    command->r = static_cast<float>(props.getProperty(runtime, "r").asNumber());
    return command;
  }
};

class CommandConverter {
public:
  static std::unique_ptr<CommandBase> convert(jsi::Runtime &runtime,
                                              const jsi::Object &object) {
    try {
      auto type = static_cast<CommandType>(
          object.getProperty(runtime, "type").asNumber());
      materializedProps(runtime, object);
      return convert(runtime, object, type);
    } catch (const std::exception &) {
      return nullptr;
    }
  }

private:
  static void materializedProps(jsi::Runtime &runtime,
                                const jsi::Object &object) {
    if (object.hasProperty(runtime, "animatedProps")) {
      auto animatedProps =
          object.getProperty(runtime, "animatedProps").asObject(runtime);
      auto props = object.getProperty(runtime, "props").asObject(runtime);
      auto propNames = animatedProps.getPropertyNames(runtime);
      auto length = propNames.length(runtime);

      for (size_t i = 0; i < length; i++) {
        auto propName = propNames.getValueAtIndex(runtime, i)
                            .asString(runtime)
                            .utf8(runtime);
        auto propValue = animatedProps.getProperty(runtime, propName.c_str())
                             .asObject(runtime)
                             .getProperty(runtime, "value");
        props.setProperty(runtime, propName.c_str(), propValue);
      }
    }
  }

  static std::unique_ptr<CommandBase>
  convert(jsi::Runtime &runtime, const jsi::Object &object, CommandType type) {
    try {
      switch (type) {
      case CommandType::Group:
        return convert<CommandType::Group>(runtime, object);
      case CommandType::SaveCTM:
        return convert<CommandType::SaveCTM>(runtime, object);
      case CommandType::SavePaint:
        return convert<CommandType::SavePaint>(runtime, object);
      case CommandType::DrawCircle:
        return DrawCircleCommand::fromJSIObject(runtime, object);
      case CommandType::DrawText:
        return convert<CommandType::DrawText>(runtime, object);
      default:
        return std::make_unique<Command<CommandType::Group>>(type);
      }
    } catch (const std::exception &) {
      return nullptr;
    }
  }

  template <CommandType T>
  static std::unique_ptr<CommandBase> convert(jsi::Runtime &runtime,
                                              const jsi::Object &object);

  // Template specializations
  template <>
  std::unique_ptr<CommandBase>
  convert<CommandType::Group>(jsi::Runtime &runtime,
                              const jsi::Object &object) {
    auto command = std::make_unique<GroupCommand>();
    auto children = object.getProperty(runtime, "children")
                        .asObject(runtime)
                        .asArray(runtime);

    for (size_t i = 0; i < children.size(runtime); i++) {
      std::unique_ptr<CommandBase> childCommand = CommandConverter::convert(
          runtime, children.getValueAtIndex(runtime, i).asObject(runtime));
      //          if (!childCommand) {
      //              throw std::runtime_error("Failed to convert child command
      //              of type");
      //          }
      command->children.push_back(std::move(childCommand));
    }
    return command;
  }

  template <>
  std::unique_ptr<CommandBase>
  convert<CommandType::SavePaint>(jsi::Runtime &runtime,
                                  const jsi::Object &object) {
    auto command = std::make_unique<SavePaintCommand>();
    return command;
  }

  template <>
  std::unique_ptr<CommandBase>
  convert<CommandType::SaveCTM>(jsi::Runtime &runtime,
                                const jsi::Object &object) {
    auto command = std::make_unique<CTMCommand>();
    return command;
  }

  template <>
  std::unique_ptr<CommandBase>
  convert<CommandType::DrawText>(jsi::Runtime &runtime,
                                 const jsi::Object &object) {
    auto command = std::make_unique<DrawTextCommand>();

    return command;
  }
};

} // namespace RNSkia
