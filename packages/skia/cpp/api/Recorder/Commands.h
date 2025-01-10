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
  static constexpr CommandType type = T;
  CommandType getType() const override { return type; }
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
  double _x;
  double _y;
  double _radius;
};

class CommandConverter {
public:
  static std::unique_ptr<CommandBase> convert(jsi::Runtime &runtime,
                                              const jsi::Object &object) {
    try {
      auto type = static_cast<CommandType>(
          object.getProperty(runtime, "type").asNumber());
      return convert(runtime, object, type);
    } catch (const std::exception &) {
      return nullptr;
    }
  }

private:
  static std::unique_ptr<CommandBase>
  convert(jsi::Runtime &runtime, const jsi::Object &object, CommandType type) {
    try {
      switch (type) {
      case CommandType::Group:
        return convert<CommandType::Group>(runtime, object);
      case CommandType::SaveCTM:
        return convert<CommandType::SaveCTM>(runtime, object);
//      case CommandType::SavePaint:
//        return convert<CommandType::SavePaint>(runtime, object);
      case CommandType::DrawCircle:
        return convert<CommandType::DrawCircle>(runtime, object);
      case CommandType::DrawText:
        return convert<CommandType::DrawText>(runtime, object);
      default:
        return nullptr;
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
    //  if (!childCommand) {
    //    throw std::runtime_error("Failed to convert child command");
    //  }
      command->children.push_back(std::move(childCommand));
    }

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
  convert<CommandType::DrawCircle>(jsi::Runtime &runtime,
                                   const jsi::Object &object) {
    auto command = std::make_unique<DrawCircleCommand>();
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
