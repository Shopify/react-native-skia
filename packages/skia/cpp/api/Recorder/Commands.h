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
    DrawTextCommand(double x, double y, std::string& text, std::shared_ptr<SkFont>& font):
      _x(x), _y(y), _text(text), _font(font) {}
private:
  double _x;
  double _y;
  std::string _text;
  std::shared_ptr<SkFont> _font;
};

class DrawCircleCommand : public Command<CommandType::DrawCircle> {
public:
    DrawCircleCommand(double x, double y, double radius): _x(x), _y(y), _radius(radius) {}
private:
  double _x;
  double _y;
  double _radius;
};

class CommandConverter {
public:
  static bool convert(jsi::Runtime &runtime, const jsi::Object &object,
                      std::unique_ptr<CommandBase> &out) {
    try {
      auto type = static_cast<CommandType>(
          object.getProperty(runtime, "type").asNumber());
      return convert(runtime, object, type, out);
    } catch (const std::exception &) {
      return false;
    }
  }

private:
  static bool convert(jsi::Runtime &runtime, const jsi::Object &object,
                      CommandType type, std::unique_ptr<CommandBase> &out) {
    try {
      switch (type) {
      case CommandType::Group:
        out = convert<CommandType::Group>(runtime, object);
        return true;
      case CommandType::SaveCTM:
        out = convert<CommandType::SaveCTM>(runtime, object);
        return true;
      case CommandType::SavePaint:
        out = convert<CommandType::SavePaint>(runtime, object);
        return true;
      case CommandType::DrawCircle:
        out = convert<CommandType::DrawCircle>(runtime, object);
        return true;
      case CommandType::DrawText:
        out = convert<CommandType::DrawText>(runtime, object);
        return true;
      default:
        return false;
      }
    } catch (const std::exception &) {
      return false;
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
      std::unique_ptr<CommandBase> childCommand;
      if (!convert(runtime,
                   children.getValueAtIndex(runtime, i).asObject(runtime),
                   childCommand)) {
        throw std::runtime_error("Failed to convert child command");
      }
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
    auto command = std::make_unique<DrawCircleCommand>(0, 0, 0);
    return command;
  }

  template <>
  std::unique_ptr<CommandBase>
  convert<CommandType::DrawText>(jsi::Runtime &runtime,
                                 const jsi::Object &object) {
    std::shared_ptr<SkFont> font = nullptr;
    std::string text = "foo";
    auto command = std::make_unique<DrawTextCommand>(0, 0, text, font);
    
    return command;
  }
};

} // namespace RNSkia
