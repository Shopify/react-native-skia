#pragma once

#include "Commands.h"
#include "DrawingCtx.h"
#include "RNSkLog.h"

#include <jsi/jsi.h>

namespace RNSkia {

namespace jsi = facebook::jsi;

void play(DrawingCtx *ctx, jsi::Runtime &runtime, CommandBase *command) {
  if (command->getType() == CommandType::SavePaint) {
    auto paintCmd = static_cast<SavePaintCommand *>(command);
    if (paintCmd->paint.has_value()) {
      // ctx->paints.push(paintCmd->paint.value());
    } else {
      ctx->savePaint();
      // setPaintProperties(ctx->Skia, ctx->paint, paintCmd->props);
    }
  } else if (command->getType() == CommandType::RestorePaint) {
    ctx->restorePaint();
  } else if (command->getType() == CommandType::Group) {
    auto group = static_cast<GroupCommand *>(command);
    RNSkLogger::logToConsole("Group()");
  } else {
    if (command->getType() == CommandType::DrawCircle) {
      auto drawCmd = static_cast<DrawCircleCommand *>(command);
      auto paint = ctx->getPaint();
      drawCmd->draw(ctx->canvas, ctx->getPaint());
    }
  }
}

} // namespace RNSkia
