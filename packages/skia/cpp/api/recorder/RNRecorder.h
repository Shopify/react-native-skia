#pragma once

#include <memory>
#include <optional>

#include "CommandType.h"

namespace RNSkia {

struct CircleProps {
  std::optional<float> cx;
  std::optional<float> cy;
  std::optional<SkPoint> c;
  float r;
};

struct Command {
    CommandType type;
    
    Command(CommandType t) : type(t) {}
    virtual ~Command() = default;
};

struct SavePaintCommand : Command {
    SavePaintCommand() : Command(CommandType::SavePaint) {}
};

struct CircleCommand : Command {
    CircleProps props;

    CircleCommand(const CircleProps& p) : Command(CommandType::DrawCircle), props(p) {}
};

class Recorder {
private:
    std::vector<std::unique_ptr<Command>> commands;

public:
    
    Recorder() = default;

    void savePaint() {
        commands.push_back(std::make_unique<SavePaintCommand>());
    }

    void restorePaint() {
        commands.push_back(std::make_unique<Command>(CommandType::RestorePaint));
    }

    void drawCircle(CircleProps& props) {
        commands.push_back(std::make_unique<CircleCommand>(props));
    }
};

} // namespace RNSkia
