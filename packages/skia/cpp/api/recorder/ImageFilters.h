#pragma once

#include <optional>
#include <string>
#include <variant>

#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"

namespace RNSkia {

struct BlurMaskFilterCmdProps {
  float blur;
  SkBlurStyle style;
  bool respectCTM;
};

class BlurMaskFilterCmd : public Command {
private:
  BlurMaskFilterCmdProps props;

public:
  BlurMaskFilterCmd(jsi::Runtime &runtime, const jsi::Object &object,
                    Variables &variables)
      : Command(CommandType::PushBlurMaskFilter, "skBlurMaskFilter") {
    convertProperty(runtime, object, "blur", props.blur, variables);
    convertProperty(runtime, object, "style", props.style, variables);
    convertProperty(runtime, object, "respectCTM", props.respectCTM, variables);
  }

  void pushMaskFilter(DrawingCtx *ctx) {
    auto [blur, style, respectCTM] = props;
    auto maskFilter = SkMaskFilter::MakeBlur(style, blur, respectCTM);
    ctx->getPaint().setMaskFilter(maskFilter);
  }
};

} // namespace RNSkia
