#pragma once

#include <optional>
#include <string>
#include <variant>

#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"

namespace RNSkia {

struct DiscretePathEffectProps {};

class DiscretePathEffectCmd : public Command {
private:
  DiscretePathEffectProps props;

public:
  DiscretePathEffectCmd(jsi::Runtime &runtime, const jsi::Object &object,
                        Variables &variables)
      : Command(CommandType::PushPathEffect, "skDiscretePathEffect") {}

  void pushPathEffect(DrawingCtx *ctx) {}
};

struct DashPathEffectProps {};

class DashPathEffectCmd : public Command {
private:
  DashPathEffectProps props;

public:
  DashPathEffectCmd(jsi::Runtime &runtime, const jsi::Object &object,
                    Variables &variables)
      : Command(CommandType::PushPathEffect, "skDashPathEffect") {}

  void pushPathEffect(DrawingCtx *ctx) {}
};

struct Path1DPathEffectProps {};

class Path1DPathEffectCmd : public Command {
private:
  Path1DPathEffectProps props;

public:
  Path1DPathEffectCmd(jsi::Runtime &runtime, const jsi::Object &object,
                      Variables &variables)
      : Command(CommandType::PushPathEffect, "skPath1DPathEffect") {}

  void pushPathEffect(DrawingCtx *ctx) {}
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