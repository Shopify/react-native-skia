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
#include "ImageFilters.h"
#include "Paint.h"
#include "Shaders.h"

namespace RNSkia {

class Recorder {
private:
  std::vector<std::unique_ptr<Command>> commands;

public:
  Variables variables;

  ~Recorder() = default;

  void savePaint(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(
        std::make_unique<SavePaintCmd>(runtime, props, variables));
  }

  void pushShader(jsi::Runtime &runtime, const std::string &nodeType,
                  const jsi::Object &props) {
    if (nodeType == "skShader") {
      commands.push_back(
          std::make_unique<PushShaderCmd>(runtime, props, variables));
    } else if (nodeType == "skImageShader") {
      commands.push_back(
          std::make_unique<PushImageShaderCmd>(runtime, props, variables));
    }
  }

  void pushBlurMaskFilter(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(
        std::make_unique<BlurMaskFilterCmd>(runtime, props, variables));
  }

  void saveCTM(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<SaveCTMCmd>(runtime, props, variables));
  }

  void restoreCTM() {
    commands.push_back(std::make_unique<Command>(CommandType::RestoreCTM));
  }

  void restorePaint() {
    commands.push_back(std::make_unique<Command>(CommandType::RestorePaint));
  }

  void drawRect(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<RectCmd>(runtime, props, variables));
  }

  void drawCircle(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<CircleCmd>(runtime, props, variables));
  }

  void drawLine(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(std::make_unique<LineCmd>(runtime, props, variables));
  }

  void drawTextPath(jsi::Runtime &runtime, const jsi::Object &props) {
    commands.push_back(
        std::make_unique<TextPathCmd>(runtime, props, variables));
  }

  void drawText(jsi::Runtime &runtime, const jsi::Object &props) {
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

      case CommandType::MaterializePaint: {
        ctx->materializePaint();
        break;
      }

      case CommandType::SavePaint: {
        auto *savePaintCmd = static_cast<SavePaintCmd *>(cmd.get());
        savePaintCmd->savePaint(ctx);
        break;
      }

      case CommandType::PushShader: {
        auto nodeType = cmd->nodeType;
        if (nodeType == "skShader") {
          auto *pushShaderCmd = static_cast<PushShaderCmd *>(cmd.get());
          pushShaderCmd->pushShader(ctx);
          break;
        } else if (nodeType == "skImageShader") {
          auto *pushImageShaderCmd =
              static_cast<PushImageShaderCmd *>(cmd.get());
          pushImageShaderCmd->pushShader(ctx);
        }
      }

      case CommandType::PushBlurMaskFilter: {
        auto *blurMaskFilterCmd = static_cast<BlurMaskFilterCmd *>(cmd.get());
        blurMaskFilterCmd->pushMaskFilter(ctx);
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

      case CommandType::DrawRect: {
        auto *rectCmd = static_cast<RectCmd *>(cmd.get());
        rectCmd->draw(ctx);
        break;
      }

      case CommandType::DrawLine: {
        auto *lineCmd = static_cast<LineCmd *>(cmd.get());
        lineCmd->draw(ctx);
        break;
      }

      case CommandType::DrawTextPath: {
        auto *textPathCmd = static_cast<TextPathCmd *>(cmd.get());
        textPathCmd->draw(ctx);
        break;
      }
      }
    }
  }
};

} // namespace RNSkia
