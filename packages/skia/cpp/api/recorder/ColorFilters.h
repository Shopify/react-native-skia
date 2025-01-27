#pragma once

#include <optional>
#include <string>
#include <variant>

#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"

namespace RNSkia {

struct MatrixColorFilterProps {};

class MatrixColorFilterCmd : public Command {
private:
  MatrixColorFilterProps props;

public:
  MatrixColorFilterCmd(jsi::Runtime &runtime, const jsi::Object &object,
                       Variables &variables)
      : Command(CommandType::PushColorFilter, "skMatrixColorFilter") {}

  void pushColorFilter(DrawingCtx *ctx) {}
};

struct BlendColorFilterProps {};

class BlendColorFilterCmd : public Command {
private:
  BlendColorFilterProps props;

public:
  BlendColorFilterCmd(jsi::Runtime &runtime, const jsi::Object &object,
                      Variables &variables)
      : Command(CommandType::PushColorFilter, "skBlendColorFilter") {}

  void pushColorFilter(DrawingCtx *ctx) {}
};

struct LinearToSRGBGammaColorFilterProps {};

class LinearToSRGBGammaColorFilterCmd : public Command {
private:
  LinearToSRGBGammaColorFilterProps props;

public:
  LinearToSRGBGammaColorFilterCmd(jsi::Runtime &runtime,
                                  const jsi::Object &object,
                                  Variables &variables)
      : Command(CommandType::PushColorFilter,
                "skLinearToSRGBGammaColorFilter") {}

  void pushColorFilter(DrawingCtx *ctx) {}
};

struct SRGBToLinearGammaColorFilterProps {};

class SRGBToLinearGammaColorFilterCmd : public Command {
private:
  SRGBToLinearGammaColorFilterProps props;

public:
  SRGBToLinearGammaColorFilterCmd(jsi::Runtime &runtime,
                                  const jsi::Object &object,
                                  Variables &variables)
      : Command(CommandType::PushColorFilter,
                "skSRGBToLinearGammaColorFilter") {}

  void pushColorFilter(DrawingCtx *ctx) {}
};

struct LumaColorFilterProps {};

class LumaColorFilterCmd : public Command {
private:
  LumaColorFilterProps props;

public:
  LumaColorFilterCmd(jsi::Runtime &runtime, const jsi::Object &object,
                     Variables &variables)
      : Command(CommandType::PushColorFilter, "skLumaColorFilter") {}

  void pushColorFilter(DrawingCtx *ctx) {}
};

struct LerpColorFilterProps {};

class LerpColorFilterCmd : public Command {
private:
  LerpColorFilterProps props;

public:
  LerpColorFilterCmd(jsi::Runtime &runtime, const jsi::Object &object,
                     Variables &variables)
      : Command(CommandType::PushColorFilter, "skLerpColorFilter") {}

  void pushColorFilter(DrawingCtx *ctx) {}
};

} // namespace RNSkia