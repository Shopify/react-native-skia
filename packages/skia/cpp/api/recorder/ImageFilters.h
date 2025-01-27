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

struct OffsetImageFilterProps {};

class OffsetImageFilterCmd : public Command {
private:
  OffsetImageFilterProps props;

public:
  OffsetImageFilterCmd(jsi::Runtime &runtime, const jsi::Object &object,
                       Variables &variables)
      : Command(CommandType::PushImageFilter, "skOffsetImageFilter") {}

  void pushImageFilter(DrawingCtx *ctx) {}
};

struct DisplacementMapImageFilterProps {};

class DisplacementMapImageFilterCmd : public Command {
private:
  DisplacementMapImageFilterProps props;

public:
  DisplacementMapImageFilterCmd(jsi::Runtime &runtime,
                                const jsi::Object &object, Variables &variables)
      : Command(CommandType::PushImageFilter, "skDisplacementMapImageFilter") {}

  void pushImageFilter(DrawingCtx *ctx) {}
};

struct BlurImageFilterProps {};

class BlurImageFilterCmd : public Command {
private:
  BlurImageFilterProps props;

public:
  BlurImageFilterCmd(jsi::Runtime &runtime, const jsi::Object &object,
                     Variables &variables)
      : Command(CommandType::PushImageFilter, "skBlurImageFilter") {}

  void pushImageFilter(DrawingCtx *ctx) {}
};

struct DropShadowImageFilterProps {};

class DropShadowImageFilterCmd : public Command {
private:
  DropShadowImageFilterProps props;

public:
  DropShadowImageFilterCmd(jsi::Runtime &runtime, const jsi::Object &object,
                           Variables &variables)
      : Command(CommandType::PushImageFilter, "skDropShadowImageFilter") {}

  void pushImageFilter(DrawingCtx *ctx) {}
};

struct MorphologyImageFilterProps {};

class MorphologyImageFilterCmd : public Command {
private:
  MorphologyImageFilterProps props;

public:
  MorphologyImageFilterCmd(jsi::Runtime &runtime, const jsi::Object &object,
                           Variables &variables)
      : Command(CommandType::PushImageFilter, "skMorphologyImageFilter") {}

  void pushImageFilter(DrawingCtx *ctx) {}
};

struct BlendImageFilterProps {};

class BlendImageFilterCmd : public Command {
private:
  BlendImageFilterProps props;

public:
  BlendImageFilterCmd(jsi::Runtime &runtime, const jsi::Object &object,
                      Variables &variables)
      : Command(CommandType::PushImageFilter, "skBlendImageFilter") {}

  void pushImageFilter(DrawingCtx *ctx) {}
};

struct RuntimeShaderImageFilterProps {};

class RuntimeShaderImageFilterCmd : public Command {
private:
  RuntimeShaderImageFilterProps props;

public:
  RuntimeShaderImageFilterCmd(jsi::Runtime &runtime, const jsi::Object &object,
                              Variables &variables)
      : Command(CommandType::PushImageFilter, "skRuntimeShaderImageFilter") {}

  void pushImageFilter(DrawingCtx *ctx) {}
};

} // namespace RNSkia
