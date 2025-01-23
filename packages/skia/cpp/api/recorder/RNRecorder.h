#pragma once

#include <memory>
#include <optional>
#include <string>
#include <vector>

#include <jsi/jsi.h>

#include "CommandType.h"
#include "Convertor.h"
#include "DrawingCtx.h"
#include "Drawings.h"

namespace RNSkia {

struct Command {
  CommandType type;

  Command(CommandType t) : type(t) {}
  virtual ~Command() = default;
};

struct SavePaintCmd : Command {
  PaintCmdProps props;

  SavePaintCmd(const PaintCmdProps &p)
      : Command(CommandType::SavePaint), props(p) {}
};

struct CircleCmd : Command {
  CircleCmdProps props;

  CircleCmd(const CircleCmdProps &p)
      : Command(CommandType::DrawCircle), props(p) {}
    
};

class Recorder {
private:
  std::vector<std::unique_ptr<Command>> commands;

public:
  Variables variables;
    
  Recorder() = default;
  ~Recorder() = default;

  void savePaint(PaintCmdProps &props) {
    commands.push_back(std::make_unique<SavePaintCmd>(props));
  }

  void restorePaint() {
    commands.push_back(std::make_unique<Command>(CommandType::RestorePaint));
  }

  void drawCircle(CircleCmdProps &props) {
    commands.push_back(std::make_unique<CircleCmd>(props));
  }

  void materializePaint() {
    commands.push_back(std::make_unique<Command>(CommandType::MaterializePaint));
  }

  void play(DrawingCtx ctx) {
    for (const auto& cmd : commands) {
        switch (cmd->type) {
            case CommandType::SavePaint:
                // Process save command
                break;
                
            case CommandType::RestorePaint:
                // Process restore command
                break;
                
            case CommandType::DrawCircle: {
                // Safe downcast since we know the type
                auto* circleCmd = static_cast<CircleCmd*>(cmd.get());
                SkPaint paint;
                auto center = SkPoint::Make(256, 256);
                ctx.canvas->drawCircle(center, circleCmd->props.r, paint);
                // Process circle command using circleCmd->props
                break;
            }
        }
    }
  }
};

} // namespace RNSkia
