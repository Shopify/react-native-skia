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

struct PushShaderProps {
  sk_sp<SkRuntimeEffect> source;
  Uniforms uniforms;
  std::optional<SkM44> transform;
  std::optional<SkPoint> origin;
  std::optional<SkMatrix> matrix;
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
    auto [source, uniforms, transform, origin, matrix] = props;
    SkMatrix m3;
    if (matrix.has_value()) {
      m3 = matrix.value();
      if (origin.has_value()) {
        m3.postTranslate(origin.value().x(), origin.value().y());
        m3.preTranslate(-origin.value().x(), -origin.value().y());
      }
    } else if (transform.has_value()) {
      auto m4 = transform.value();
      if (origin.has_value()) {
        m4.postTranslate(origin.value().x(), origin.value().y());
        m4.preTranslate(-origin.value().x(), -origin.value().y());
      }
      m3 = m4.asM33();
    }

    auto uniformSize = source->uniformSize();
    auto uniformsData = SkData::MakeUninitialized(uniformSize);
    float *uniformPtr = static_cast<float *>(uniformsData->writable_data());

    for (const auto &[name, data] : uniforms) {
      auto it =
          std::find_if(source->uniforms().begin(), source->uniforms().end(),
                       [&name](const auto &u) { return u.name == name; });
      if (it != source->uniforms().end()) {
        memcpy(uniformPtr + it->offset / sizeof(float), data.data(),
               data.size() * sizeof(float));
      }
    }
    std::vector<sk_sp<SkShader>> children = ctx->popAllShaders();
    auto shader = source->makeShader(std::move(uniformsData), children.data(),
                                     children.size(), &m3);

    ctx->shaders.push_back(shader);
  }
};

struct PushImageShaderProps {
  SkTileMode tx;
  SkTileMode ty;
  float x = 0;
  float y = 0;
  std::optional<float> width;
  std::optional<float> height;
  std::optional<SkRect> rect;
  std::string fit;
  std::optional<sk_sp<SkImage>> image;
  SkSamplingOptions sampling = SkSamplingOptions(SkFilterMode::kLinear);

  std::optional<SkM44> transform;
  std::optional<SkPoint> origin;
  std::optional<SkMatrix> matrix;
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
  }

  void pushShader(DrawingCtx *ctx) {
    auto [tx, ty, x, y, width, height, rect, fit, image, sampling, transform,
          origin, matrix] = props;
    if (image.has_value()) {
      auto img = image.value();
      SkMatrix m33;
      auto hasRect =
          rect.has_value() || (width.has_value() && height.has_value());
      if (hasRect) {
        auto src = SkRect::MakeXYWH(0, 0, img->width(), img->height());
        auto dst = rect.has_value()
                       ? rect.value()
                       : SkRect::MakeXYWH(x, y, width.value(), height.value());
        auto rects = RNSkiaImage::fitRects(fit, src, dst);
        auto m = RNSkiaImage::rect2rect(rects.src, rects.dst);
        m33.preConcat(m);
      }
      SkMatrix lm;
      lm.preConcat(m33);
      SkMatrix m3;
      if (matrix.has_value()) {
        m3 = matrix.value();
        if (origin.has_value()) {
          m3.postTranslate(origin.value().x(), origin.value().y());
          m3.preTranslate(-origin.value().x(), -origin.value().y());
        }
      } else if (transform.has_value()) {
        auto m4 = transform.value();
        if (origin.has_value()) {
          m4.postTranslate(origin.value().x(), origin.value().y());
          m4.preTranslate(-origin.value().x(), -origin.value().y());
        }
        m3 = m4.asM33();
      }
      lm.preConcat(m3);
      auto shader = img->makeShader(tx, ty, sampling, &m3);
      ctx->shaders.push_back(shader);
    }
  }
};

} // namespace RNSkia
