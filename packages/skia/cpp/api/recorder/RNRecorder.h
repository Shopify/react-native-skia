#pragma once

#include <memory>
#include <optional>
#include <string>
#include <vector>

#include <jsi/jsi.h>

#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"
#include "Drawings.h"
#include "Paint.h"

namespace RNSkia {

class Recorder {
private:
  std::vector<std::unique_ptr<Command>> commands;

public:
  Variables variables;

  ~Recorder() = default;

  void savePaint(jsi::Runtime &runtime, const jsi::Object &props,
                 Variables &variables) {
    commands.push_back(
        std::make_unique<SavePaintCmd>(runtime, props, variables));
  }

  void restorePaint() {
    commands.push_back(std::make_unique<Command>(CommandType::RestorePaint));
  }

  void drawCircle(jsi::Runtime &runtime, const jsi::Object &props,
                  Variables &variables) {
    commands.push_back(std::make_unique<CircleCmd>(runtime, props, variables));
  }

  void materializePaint() {
    commands.push_back(
        std::make_unique<Command>(CommandType::MaterializePaint));
  }

  void play(DrawingCtx *ctx) {
    for (const auto &cmd : commands) {
      switch (cmd->type) {
      case CommandType::SavePaint: {
        auto *savePaintCmd = static_cast<SavePaintCmd *>(cmd.get());
        savePaintCmd->savePaint(ctx);
        break;
      }

      case CommandType::RestorePaint: {
        // Process restore command
        break;
      }

      case CommandType::DrawCircle: {
        auto *circleCmd = static_cast<CircleCmd *>(cmd.get());
        circleCmd->draw(ctx);
        break;
      }
      }
    }
  }
};

} // namespace RNSkia
