#pragma once

#include <optional>
#include <string>
#include <variant>

#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"

namespace RNSkia {

struct DiscretePathEffectProps {
  float length;
  float deviation;
  uint32_t seed;
};

class DiscretePathEffectCmd : public Command {
private:
  DiscretePathEffectProps props;

public:
  DiscretePathEffectCmd(jsi::Runtime &runtime, const jsi::Object &object,
                        Variables &variables)
      : Command(CommandType::PushPathEffect, "skDiscretePathEffect") {
    convertProperty(runtime, object, "length", props.length, variables);
    convertProperty(runtime, object, "deviation", props.deviation, variables);
    convertProperty(runtime, object, "seed", props.seed, variables);
  }

  void pushPathEffect(DrawingCtx *ctx) {
    auto pe =
        SkDiscretePathEffect::Make(props.length, props.deviation, props.seed);
    ctx->pathEffects.push_back(pe);
  }
};

struct DashPathEffectProps {
  std::vector<float> intervals;
  float phase = 0;
};

class DashPathEffectCmd : public Command {
private:
  DashPathEffectProps props;

public:
  DashPathEffectCmd(jsi::Runtime &runtime, const jsi::Object &object,
                    Variables &variables)
      : Command(CommandType::PushPathEffect, "skDashPathEffect") {
    convertProperty(runtime, object, "intervals", props.intervals, variables);
    convertProperty(runtime, object, "phase", props.phase, variables);
}

  void pushPathEffect(DrawingCtx *ctx) {
    auto pe = SkDashPathEffect::Make(props.intervals.data(), props.intervals.size(), props.phase);
    ctx->pathEffects.push_back(pe);
  }
};

struct Path1DPathEffectProps {

  SkPath path;
  float advance;
  float phase;
  unsigned int style;
};

class Path1DPathEffectCmd : public Command {
private:
  Path1DPathEffectProps props;

public:
  Path1DPathEffectCmd(jsi::Runtime &runtime, const jsi::Object &object,
                      Variables &variables)
      : Command(CommandType::PushPathEffect, "skPath1DPathEffect") {
    convertProperty(runtime, object, "path", props.path, variables);
    convertProperty(runtime, object, "advance", props.advance, variables);
    convertProperty(runtime, object, "phase", props.phase, variables);
    convertProperty(runtime, object, "style", props.style, variables);
    }

  void pushPathEffect(DrawingCtx *ctx) {
    auto pe = SkPath1DPathEffect::Make(props.path, props.advance, props.phase, static_cast<SkPath1DPathEffect::Style>(props.style));
    if (pe) {
      ctx->pathEffects.push_back(pe);
    }
  }
};

struct Path2DPathEffectProps {};

class Path2DPathEffectCmd : public Command {
private:
  Path2DPathEffectProps props;

public:
  Path2DPathEffectCmd(jsi::Runtime &runtime, const jsi::Object &object,
                      Variables &variables)
      : Command(CommandType::PushPathEffect, "skPath2DPathEffect") {}

  void pushPathEffect(DrawingCtx *ctx) {}
};

struct CornerPathEffectProps {};

class CornerPathEffectCmd : public Command {
private:
  CornerPathEffectProps props;

public:
  CornerPathEffectCmd(jsi::Runtime &runtime, const jsi::Object &object,
                      Variables &variables)
      : Command(CommandType::PushPathEffect, "skCornerPathEffect") {}

  void pushPathEffect(DrawingCtx *ctx) {}
};

struct SumPathEffectProps {};

class SumPathEffectCmd : public Command {
private:
  SumPathEffectProps props;

public:
  SumPathEffectCmd(jsi::Runtime &runtime, const jsi::Object &object,
                   Variables &variables)
      : Command(CommandType::PushPathEffect, "skSumPathEffect") {}

  void pushPathEffect(DrawingCtx *ctx) {}
};

struct Line2DPathEffectProps {};

class Line2DPathEffectCmd : public Command {
private:
  Line2DPathEffectProps props;

public:
  Line2DPathEffectCmd(jsi::Runtime &runtime, const jsi::Object &object,
                      Variables &variables)
      : Command(CommandType::PushPathEffect, "skLine2DPathEffect") {}

  void pushPathEffect(DrawingCtx *ctx) {}
};

} // namespace RNSkia
