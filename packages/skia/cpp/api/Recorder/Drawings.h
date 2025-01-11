#pragma once

#include <memory>

#include <jsi/jsi.h>

#include "Commands.h"

namespace RNSkia {

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
} // namespace RNSkia