#pragma once

#include <optional>
#include <string>
#include <variant>

#include <include/core/SkSamplingOptions.h>

#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"
#include "Image.h"

namespace RNSkia {

struct PushShaderProps : TransformProps {
  sk_sp<SkRuntimeEffect> source;
  Uniforms uniforms;
};

class PushShaderCmd : public Command {
private:
  PushShaderProps props;

public:
  PushShaderCmd(jsi::Runtime &runtime, const jsi::Object &object,
                Variables &variables)
      : Command(CommandType::PushShader, "skShader") {
    convertProperty(runtime, object, "transform", props.transform, variables);
    convertProperty(runtime, object, "origin", props.origin, variables);
    convertProperty(runtime, object, "matrix", props.matrix, variables);
    convertProperty(runtime, object, "source", props.source, variables);
    convertProperty(runtime, object, "uniforms", props.uniforms, variables);
  }

  void pushShader(DrawingCtx *ctx) {
    auto source = props.source;
    auto uniforms = props.uniforms;
    auto m3 = processTransform(props.matrix, props.transform, props.origin);

    // Calculate total size needed for uniforms
    size_t uniformSize = source->uniformSize();
    auto uniformsData = SkData::MakeUninitialized(uniformSize);
    auto uniformDataPtr = static_cast<float*>(uniformsData->writable_data());

    // Loop through all uniforms in the effect
    const auto &u = source->uniforms();
    for (std::size_t i = 0; i < u.size(); i++) {
      auto it = source->uniforms().begin() + i;
      RuntimeEffectUniform reu = JsiSkRuntimeEffect::fromUniform(*it);
      
      // Find the corresponding uniform value in our props
      auto uniformIt = uniforms.find(std::string(it->name));
      if (uniformIt == uniforms.end()) {
        throw std::runtime_error("Missing uniform value for: " + 
                               std::string(it->name));
      }

      const auto& uniformValues = uniformIt->second;
      size_t expectedSize = reu.columns * reu.rows;
      if (uniformValues.size() != expectedSize) {
        throw std::runtime_error("Incorrect uniform size for: " + 
                               std::string(it->name) + ". Expected " + 
                               std::to_string(expectedSize) + " got " + 
                               std::to_string(uniformValues.size()));
      }

      // Process each element in the uniform (handling matrices and vectors)
      for (std::size_t j = 0; j < expectedSize; ++j) {
        const std::size_t offset = reu.slot + j;
        float fValue = uniformValues[j];
        
        // Handle integer uniforms by converting to float bits
        if (reu.isInteger) {
          int iValue = static_cast<int>(fValue);
          uniformDataPtr[offset] = SkBits2Float(iValue);
        } else {
          uniformDataPtr[offset] = fValue;
        }
      }
    }

    std::vector<sk_sp<SkShader>> children = ctx->popAllShaders();
    auto shader = source->makeShader(std::move(uniformsData), children.data(),
                                   children.size(), &m3);

    ctx->shaders.push_back(shader);
  }
};

struct PushImageShaderProps : TransformProps {
  SkTileMode tx;
  SkTileMode ty;
  float x = 0;
  float y = 0;
  std::optional<float> width;
  std::optional<float> height;
  std::optional<SkRect> rect;
  std::string fit;
  std::optional<sk_sp<SkImage>> image;
  std::optional<SkSamplingOptions> sampling;
};

class PushImageShaderCmd : public Command {
private:
  PushImageShaderProps props;

public:
  PushImageShaderCmd(jsi::Runtime &runtime, const jsi::Object &object,
                     Variables &variables)
      : Command(CommandType::PushShader, "skImageShader") {
    convertProperty(runtime, object, "tx", props.tx, variables);
    convertProperty(runtime, object, "ty", props.ty, variables);
    convertProperty(runtime, object, "rect", props.rect, variables);
    convertProperty(runtime, object, "image", props.image, variables);
    convertProperty(runtime, object, "sampling", props.sampling, variables);

    convertProperty(runtime, object, "transform", props.transform, variables);
    convertProperty(runtime, object, "origin", props.origin, variables);
    convertProperty(runtime, object, "matrix", props.matrix, variables);

    convertProperty(runtime, object, "fit", props.fit, variables);
    convertProperty(runtime, object, "x", props.x, variables);
    convertProperty(runtime, object, "y", props.y, variables);
    convertProperty(runtime, object, "width", props.width, variables);
    convertProperty(runtime, object, "height", props.height, variables);
    convertProperty(runtime, object, "rect", props.rect, variables);
  }

  void pushShader(DrawingCtx *ctx) {
    auto x = props.x;
    auto y = props.y;
    auto width = props.width;
    auto height = props.height;
    auto rect = props.rect;
    if (props.image.has_value()) {
      auto img = props.image.value();
      SkMatrix m33;
      auto hasRect =
          rect.has_value() || (width.has_value() && height.has_value());
      if (hasRect) {
        auto src = SkRect::MakeXYWH(0, 0, img->width(), img->height());
        auto dst = rect.has_value()
                       ? rect.value()
                       : SkRect::MakeXYWH(x, y, width.value(), height.value());
        auto rects = RNSkiaImage::fitRects(props.fit, src, dst);
        auto m = RNSkiaImage::rect2rect(rects.src, rects.dst);
        m33.preConcat(m);
      }
      SkMatrix lm;
      lm.preConcat(m33);
      auto m3 = processTransform(props.matrix, props.transform, props.origin);
      lm.preConcat(m3);
      auto shader = img->makeShader(
          props.tx, props.ty,
          props.sampling.value_or(SkSamplingOptions(SkFilterMode::kLinear)),
          &lm);
      ctx->shaders.push_back(shader);
    }
  }
};

struct GradientProps : TransformProps {
  std::vector<SkColor> colors;
  std::optional<std::vector<float>> positions;
  std::optional<SkTileMode> mode;
  std::optional<uint32_t> flags;
};

struct ColorShaderProps {
  SkColor color;
};

class ColorShaderCmd : public Command {
private:
  ColorShaderProps props;

public:
  ColorShaderCmd(jsi::Runtime &runtime, const jsi::Object &object,
                 Variables &variables)
      : Command(CommandType::PushShader, "skColorShader") {
    convertProperty(runtime, object, "color", props.color, variables);
  }

  void pushShader(DrawingCtx *ctx) {
    auto shader = SkShaders::Color(props.color);
    ctx->shaders.push_back(shader);
  }
};

struct TurbulenceProps {
  float freqX;
  float freqY;
  int octaves;
  float seed;
  float tileWidth;
  float tileHeight;
};

class TurbulenceCmd : public Command {
private:
  TurbulenceProps props;

public:
  TurbulenceCmd(jsi::Runtime &runtime, const jsi::Object &object,
                Variables &variables)
      : Command(CommandType::PushShader, "skTurbulence") {
    convertProperty(runtime, object, "freqX", props.freqX, variables);
    convertProperty(runtime, object, "freqY", props.freqY, variables);
    convertProperty(runtime, object, "octaves", props.octaves, variables);
    convertProperty(runtime, object, "seed", props.seed, variables);
    convertProperty(runtime, object, "tileWidth", props.tileWidth, variables);
    convertProperty(runtime, object, "tileHeight", props.tileHeight, variables);
  }

  void pushShader(DrawingCtx *ctx) {
    auto size = SkISize::Make(props.tileWidth, props.tileHeight);
    auto shader = SkShaders::MakeTurbulence(props.freqX, props.freqY,
                                            props.octaves, props.seed, &size);
    ctx->shaders.push_back(shader);
  }
};

struct FractalNoiseProps {
  float freqX;
  float freqY;
  int octaves;
  float seed;
  float tileWidth;
  float tileHeight;
};

class FractalNoiseCmd : public Command {
private:
  FractalNoiseProps props;

public:
  FractalNoiseCmd(jsi::Runtime &runtime, const jsi::Object &object,
                  Variables &variables)
      : Command(CommandType::PushShader, "skFractalNoise") {
    convertProperty(runtime, object, "freqX", props.freqX, variables);
    convertProperty(runtime, object, "freqY", props.freqY, variables);
    convertProperty(runtime, object, "octaves", props.octaves, variables);
    convertProperty(runtime, object, "seed", props.seed, variables);
    convertProperty(runtime, object, "tileWidth", props.tileWidth, variables);
    convertProperty(runtime, object, "tileHeight", props.tileHeight, variables);
  }

  void pushShader(DrawingCtx *ctx) {
    auto size = SkISize::Make(props.tileWidth, props.tileHeight);
    auto shader = SkShaders::MakeFractalNoise(props.freqX, props.freqY,
                                              props.octaves, props.seed, &size);
    ctx->shaders.push_back(shader);
  }
};

struct LinearGradientProps : GradientProps {
  SkPoint start;
  SkPoint end;
};

class LinearGradientCmd : public Command {
private:
  LinearGradientProps props;

public:
  LinearGradientCmd(jsi::Runtime &runtime, const jsi::Object &object,
                    Variables &variables)
      : Command(CommandType::PushShader, "skLinearGradient") {
    convertProperty(runtime, object, "start", props.start, variables);
    convertProperty(runtime, object, "end", props.end, variables);
    convertProperty(runtime, object, "colors", props.colors, variables);
    convertProperty(runtime, object, "positions", props.positions, variables);
    convertProperty(runtime, object, "mode", props.mode, variables);
    convertProperty(runtime, object, "flags", props.flags, variables);

    convertProperty(runtime, object, "transform", props.transform, variables);
    convertProperty(runtime, object, "origin", props.origin, variables);
    convertProperty(runtime, object, "matrix", props.matrix, variables);
  }

  void pushShader(DrawingCtx *ctx) {
    SkMatrix m3 = processTransform(props.matrix, props.transform, props.origin);
    const SkPoint pts[2] = {props.start, props.end};
    auto shader = SkGradientShader::MakeLinear(
        pts, props.colors.data(),
        props.positions ? props.positions->data() : nullptr,
        props.colors.size(), props.mode.value_or(SkTileMode::kClamp),
        props.flags.value_or(0), &m3);
    ctx->shaders.push_back(shader);
  }
};

struct RadialGradientProps : GradientProps {
  SkPoint center;
  float radius;
};

class RadialGradientCmd : public Command {
private:
  RadialGradientProps props;

public:
  RadialGradientCmd(jsi::Runtime &runtime, const jsi::Object &object,
                    Variables &variables)
      : Command(CommandType::PushShader, "skRadialGradient") {
    convertProperty(runtime, object, "c", props.center, variables);
    convertProperty(runtime, object, "r", props.radius, variables);
    convertProperty(runtime, object, "colors", props.colors, variables);
    convertProperty(runtime, object, "positions", props.positions, variables);
    convertProperty(runtime, object, "mode", props.mode, variables);
    convertProperty(runtime, object, "flags", props.flags, variables);

    convertProperty(runtime, object, "transform", props.transform, variables);
    convertProperty(runtime, object, "origin", props.origin, variables);
    convertProperty(runtime, object, "matrix", props.matrix, variables);
  }

  void pushShader(DrawingCtx *ctx) {
    SkMatrix m3 = processTransform(props.matrix, props.transform, props.origin);
    auto shader = SkGradientShader::MakeRadial(
        props.center, props.radius, props.colors.data(),
        props.positions ? props.positions->data() : nullptr,
        props.colors.size(), props.mode.value_or(SkTileMode::kClamp),
        props.flags.value_or(0), &m3);
    ctx->shaders.push_back(shader);
  }
};

struct SweepGradientProps : GradientProps {
  SkPoint center;
  std::optional<float> start;
  std::optional<float> end;
};

class SweepGradientCmd : public Command {
private:
  SweepGradientProps props;

public:
  SweepGradientCmd(jsi::Runtime &runtime, const jsi::Object &object,
                   Variables &variables)
      : Command(CommandType::PushShader, "skSweepGradient") {
    convertProperty(runtime, object, "c", props.center, variables);
    convertProperty(runtime, object, "start", props.start, variables);
    convertProperty(runtime, object, "end", props.end, variables);
    convertProperty(runtime, object, "colors", props.colors, variables);
    convertProperty(runtime, object, "positions", props.positions, variables);
    convertProperty(runtime, object, "mode", props.mode, variables);
    convertProperty(runtime, object, "flags", props.flags, variables);

    convertProperty(runtime, object, "transform", props.transform, variables);
    convertProperty(runtime, object, "origin", props.origin, variables);
    convertProperty(runtime, object, "matrix", props.matrix, variables);
  }

  void pushShader(DrawingCtx *ctx) {
    SkMatrix m3 = processTransform(props.matrix, props.transform, props.origin);
    auto shader = SkGradientShader::MakeSweep(
        props.center.x(), props.center.y(), props.colors.data(),
        props.positions ? props.positions->data() : nullptr,
        props.colors.size(), props.mode.value_or(SkTileMode::kClamp),
        props.start.value_or(0), props.end.value_or(360),
        props.flags.value_or(0), &m3);
    ctx->shaders.push_back(shader);
  }
};

struct TwoPointConicalGradientProps : GradientProps {
  SkPoint start;
  float startRadius;
  SkPoint end;
  float endRadius;
};

class TwoPointConicalGradientCmd : public Command {
private:
  TwoPointConicalGradientProps props;

public:
  TwoPointConicalGradientCmd(jsi::Runtime &runtime, const jsi::Object &object,
                             Variables &variables)
      : Command(CommandType::PushShader, "skTwoPointConicalGradient") {
    convertProperty(runtime, object, "start", props.start, variables);
    convertProperty(runtime, object, "startR", props.startRadius, variables);
    convertProperty(runtime, object, "end", props.end, variables);
    convertProperty(runtime, object, "endR", props.endRadius, variables);
    convertProperty(runtime, object, "colors", props.colors, variables);
    convertProperty(runtime, object, "positions", props.positions, variables);
    convertProperty(runtime, object, "mode", props.mode, variables);
    convertProperty(runtime, object, "flags", props.flags, variables);

    convertProperty(runtime, object, "transform", props.transform, variables);
    convertProperty(runtime, object, "origin", props.origin, variables);
    convertProperty(runtime, object, "matrix", props.matrix, variables);
  }

  void pushShader(DrawingCtx *ctx) {
    SkMatrix m3 = processTransform(props.matrix, props.transform, props.origin);
    auto shader = SkGradientShader::MakeTwoPointConical(
        props.start, props.startRadius, props.end, props.endRadius,
        props.colors.data(),
        props.positions ? props.positions->data() : nullptr,
        props.colors.size(), props.mode.value_or(SkTileMode::kClamp),
        props.flags.value_or(0), &m3);
    ctx->shaders.push_back(shader);
  }
};

} // namespace RNSkia
