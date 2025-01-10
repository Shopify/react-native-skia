#pragma once

#include "Commands.h"
#include "DrawingCtx.h"

#include <jsi/jsi.h>

namespace RNSkia {

namespace jsi = facebook::jsi;

void play(DrawingCtx *ctx, jsi::Runtime &runtime, const jsi::Object &command) {
  ctx->canvas->drawColor(SK_ColorCYAN);
  auto type =
      static_cast<CommandType>(command.getProperty(runtime, "type").asNumber());
  if (type == CommandType::Group) {
    // auto group = Convertor::Group(runtime, command);
    //  group.children.forEach((child) => play(ctx, runtime, child));
    return;
  }
}

} // namespace RNSkia
