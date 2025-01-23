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

void convert(jsi::Runtime& runtime, const jsi::Object& object,
            CircleCmdProps& props, Variables& variables) {
    convertProperty<float>(runtime, object, "cx", props.cx, variables);
    convertProperty<float>(runtime, object, "cy", props.cy, variables);
    convertProperty<SkPoint>(runtime, object, "c", props.c, variables);
    convertProperty<float>(runtime, object, "r", props.r, variables);
}

class CircleCmd : public Command {
private:
  CircleCmdProps props;

public:
  CircleCmd(const CircleCmdProps &p)
      : Command(CommandType::DrawCircle), props(p) {}
    
    void draw(DrawingCtx* ctx) {
        auto paint = ctx->getPaint();
        if (props.cx.has_value() && props.cy.has_value()) {
            ctx->canvas->drawCircle(props.cx.value(), props.cy.value(), props.r, paint);
        } else if (props.c.has_value()) {
            ctx->canvas->drawCircle(props.c.value(), props.r, paint);
        }
    }
};

} // namespace RNSkia
