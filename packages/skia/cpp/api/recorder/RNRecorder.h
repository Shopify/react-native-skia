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

  void saveCTM(jsi::Runtime &runtime, const jsi::Object &props,
               Variables &variables) {
    commands.push_back(std::make_unique<SaveCTMCmd>(runtime, props, variables));
  }

  void restoreCTM() {
    commands.push_back(std::make_unique<Command>(CommandType::RestoreCTM));
  }

  void restorePaint() {
    commands.push_back(std::make_unique<Command>(CommandType::RestorePaint));
  }

  void drawCircle(jsi::Runtime &runtime, const jsi::Object &props,
                  Variables &variables) {
    commands.push_back(std::make_unique<CircleCmd>(runtime, props, variables));
  }

  void drawText(jsi::Runtime &runtime, const jsi::Object &props,
                Variables &variables) {
    commands.push_back(std::make_unique<TextCmd>(runtime, props, variables));
  }

  void drawPaint() {
    commands.push_back(std::make_unique<Command>(CommandType::DrawPaint));
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

      case CommandType::DrawPaint: {
        ctx->canvas->drawPaint(ctx->getPaint());
        break;
      }

      case CommandType::DrawText: {
        auto *textCmd = static_cast<TextCmd *>(cmd.get());
        textCmd->draw(ctx);
        break;
      }

      case CommandType::RestorePaint: {
        ctx->restorePaint();
        break;
      }

      case CommandType::SaveCTM: {
        auto *saveCTMCmd = static_cast<SaveCTMCmd *>(cmd.get());
        saveCTMCmd->saveCTM(ctx);
        break;
      }

      case CommandType::RestoreCTM: {
        ctx->canvas->restore();
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
