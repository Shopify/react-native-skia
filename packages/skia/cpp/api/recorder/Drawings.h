#pragma once

#include <optional>

#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"

namespace RNSkia {

struct CircleCmdProps {
  std::optional<float> cx;
  std::optional<float> cy;
  std::optional<SkPoint> c;
  float r;
};

class CircleCmd : public Command {
private:
  CircleCmdProps props;

public:
  CircleCmd(jsi::Runtime &runtime, const jsi::Object &object,
            Variables &variables)
      : Command(CommandType::DrawCircle) {
    convertProperty(runtime, object, "cx", props.cx, variables);
    convertProperty(runtime, object, "cy", props.cy, variables);
    convertProperty(runtime, object, "c", props.c, variables);
    convertProperty(runtime, object, "r", props.r, variables);
  }

  void draw(DrawingCtx *ctx) {
    auto paint = ctx->getPaint();
    if (props.cx.has_value() && props.cy.has_value()) {
      auto cx = props.cx.value();
      auto cy = props.cy.value();
      auto r = props.r;
      ctx->canvas->drawCircle(cx, cy, r, paint);
    } else if (props.c.has_value()) {
      ctx->canvas->drawCircle(props.c.value(), props.r, paint);
    }
  }
};

struct RectCmdProps {

};

class RectCmd : public Command {
private:
  RectCmdProps props;

public:
    RectCmd(jsi::Runtime &runtime, const jsi::Object &object,
            Variables &variables)
      : Command(CommandType::DrawRect) {

  }

  void draw(DrawingCtx *ctx) {
    // auto paint = ctx->getPaint();
    // if (props.cx.has_value() && props.cy.has_value()) {
    //   auto cx = props.cx.value();
    //   auto cy = props.cy.value();
    //   auto r = props.r;
    //   ctx->canvas->drawCircle(cx, cy, r, paint);
    // } else if (props.c.has_value()) {
    //   ctx->canvas->drawCircle(props.c.value(), props.r, paint);
    // }
  }
};

struct TextCmdProps {
  std::optional<SkFont> font;
  std::string text;
  float x;
  float y;
};

class TextCmd : public Command {
private:
  TextCmdProps props;

public:
  TextCmd(jsi::Runtime &runtime, const jsi::Object &object,
          Variables &variables)
      : Command(CommandType::DrawText) {
    convertProperty(runtime, object, "font", props.font, variables);
    convertProperty(runtime, object, "text", props.text, variables);
    convertProperty(runtime, object, "x", props.x, variables);
    convertProperty(runtime, object, "y", props.y, variables);
  }

  void draw(DrawingCtx *ctx) {
    auto [font, text, x, y] = props;
    auto paint = ctx->getPaint();
    if (font.has_value()) {
      ctx->canvas->drawSimpleText(text.c_str(), text.length(),
                                  SkTextEncoding::kUTF8, x, y, font.value(),
                                  paint);
    }
  }
};

} // namespace RNSkia
