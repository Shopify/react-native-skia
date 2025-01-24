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
  CircleCmd(jsi::Runtime &runtime, const jsi::Object &object, Variables& variables)
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
      ctx->canvas->drawCircle(cx, cy, r,
                              paint);
    } else if (props.c.has_value()) {
      ctx->canvas->drawCircle(props.c.value(), props.r, paint);
    }
  }
};

} // namespace RNSkia
