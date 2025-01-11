#pragma once

#include <memory>

#include <jsi/jsi.h>

#include "Commands.h"

#include "JsiSkFont.h"

namespace RNSkia {

class DrawTextCommand : public Command<CommandType::DrawText> {
public:
  double x;
  double y;
  std::string text;
  std::shared_ptr<SkFont> font;

  void draw(SkCanvas *canvas, SkPaint &paint) {
    canvas->drawSimpleText(text.c_str(), text.size(), SkTextEncoding::kUTF8, x,
                           y, *font, paint);
  }

  static std::unique_ptr<DrawTextCommand>
  fromJSIObject(jsi::Runtime &runtime, const jsi::Object &object) {
    auto command = std::make_unique<DrawTextCommand>();
    auto props = object.getProperty(runtime, "props").asObject(runtime);

    if (props.hasProperty(runtime, "font")) {
      command->font = props.getProperty(runtime, "font")
                          .asObject(runtime)
                          .asHostObject<JsiSkFont>(runtime)
                          ->getObject();
    }
    if (!props.hasProperty(runtime, "x") || !props.hasProperty(runtime, "y") ||
        !props.hasProperty(runtime, "text") ||
        !props.getProperty(runtime, "x").isNumber() ||
        !props.getProperty(runtime, "y").isNumber() ||
        !props.getProperty(runtime, "text").isString()) {
      throw std::runtime_error("Invalid text properties");
    }
    command->x = props.getProperty(runtime, "x").asNumber();
    command->y = props.getProperty(runtime, "y").asNumber();
    command->text =
        props.getProperty(runtime, "text").asString(runtime).utf8(runtime);
    return command;
  }
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
} // namespace RNSkia
