#pragma once

#include <optional>
#include <string>
#include <variant>

#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"

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

  void pushShader(DrawingCtx* ctx) {
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
    auto shader = source->makeShaderWithChildren(
        uniforms.data(), uniforms.size(), ctx->popAllShaders().data(), ctx->shaders.size(), m3);
    ctx->shaders.push_back(shader);
  }
};

} // namespace RNSkia
