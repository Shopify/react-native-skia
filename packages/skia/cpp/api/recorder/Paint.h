#pragma once

#include <optional>

#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"

namespace RNSkia {

struct PaintCmdProps {
  std::optional<float> opacity;
};

class SavePaintCmd : public Command {
private:
  PaintCmdProps props;

public:
  SavePaintCmd(jsi::Runtime &runtime, const jsi::Object &object,
               Variables &variables)
      : Command(CommandType::SavePaint) {
    convertProperty(runtime, object, "opacity", props.opacity, variables);
  }

  void savePaint(DrawingCtx *ctx) {}
};

} // namespace RNSkia
