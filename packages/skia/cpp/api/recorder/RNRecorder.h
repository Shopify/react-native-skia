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

namespace RNSkia {

struct PaintCmdProps {
    
};

class SavePaintCmd : public Command {
private:
  PaintCmdProps props;

public:
  SavePaintCmd(const PaintCmdProps &p)
      : Command(CommandType::SavePaint), props(p) {}
};

class Recorder {
private:
  std::vector<std::unique_ptr<Command>> commands;

public:
  Updates updates;

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

  void play(DrawingCtx* ctx) {
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
                circleCmd->draw(ctx);
                break;
            }
        }
    }
  }
};

} // namespace RNSkia
