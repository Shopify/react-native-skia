#pragma once

#include <JsiSkHostObjects.h>
#include <JsiSkShader.h>
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkRuntimeEffect.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

struct RuntimeEffectUniform {
  int columns;
  int rows;
  int slot; // the index into the uniforms array that this uniform begins.
  bool isInteger;
};

class JsiSkRuntimeEffect
    : public JsiSkWrappingSkPtrHostObject<SkRuntimeEffect> {
public:
  JSI_HOST_FUNCTION(makeShader) {
    // Set up arguments - start with Uniforms
    sk_sp<SkData> uniforms;
    if (count >= 1) {
      // Verify uniforms
      auto jsiUniforms = arguments[0].asObject(runtime).asArray(runtime);
      auto jsiUniformsSize = jsiUniforms.size(runtime);

      // verify size of input uniforms
      if (jsiUniformsSize * sizeof(float) != getObject()->uniformSize()) {
        jsi::detail::throwJSError(
            runtime, "Uniforms size differs from effect's uniform size.");
      }

      uniforms = SkData::MakeUninitialized(getObject()->uniformSize());

      // Convert to skia uniforms
      for (int i = 0; i < jsiUniformsSize; i++) {
        // We only support floats for now
        float value = jsiUniforms.getValueAtIndex(runtime, i).asNumber();
        memcpy(SkTAddOffset<void>(uniforms->writable_data(), i * sizeof(value)),
               &value, sizeof(value));
      }
    }

    // Children
    std::vector<sk_sp<SkShader>> children;
    auto isOpaque = count >= 2 ? arguments[1].getBool() : false;
    auto m3 = count < 3 ? nullptr
                        : JsiSkMatrix::fromValue(runtime, arguments[2]).get();

    // Create and return shader as host object
    auto shader = getObject()->makeShader(std::move(uniforms), children.data(),
                                          children.size(), m3, isOpaque);
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkShader>(getContext(), shader));
  }

  JSI_HOST_FUNCTION(makeShaderWithChildren) {
    // Set up arguments - start with Uniforms
    sk_sp<SkData> uniforms;
    if (count >= 1) {
      // Verify uniforms
      auto jsiUniforms = arguments[0].asObject(runtime).asArray(runtime);
      auto jsiUniformsSize = jsiUniforms.size(runtime);

      // verify size of input uniforms
      if (jsiUniformsSize * sizeof(float) != getObject()->uniformSize()) {
        jsi::detail::throwJSError(
            runtime, "Uniforms size differs from effect's uniform size.");
      }

      uniforms = SkData::MakeUninitialized(getObject()->uniformSize());

      // Convert to skia uniforms
      for (int i = 0; i < jsiUniformsSize; i++) {
        // We only support floats for now
        float value = jsiUniforms.getValueAtIndex(runtime, i).asNumber();
        memcpy(SkTAddOffset<void>(uniforms->writable_data(), i * sizeof(value)),
               &value, sizeof(value));
      }
    }

    auto isOpaque = arguments[1].isBool() ? arguments[1].getBool() : false;
    // Children
    std::vector<sk_sp<SkShader>> children;
    auto jsiChildren = arguments[2].asObject(runtime).asArray(runtime);
    auto jsiChildCount = jsiChildren.size(runtime);
    for (int i = 0; i < jsiChildCount; i++) {
      auto shader = jsiChildren.getValueAtIndex(runtime, i)
                        .asObject(runtime)
                        .asHostObject<JsiSkShader>(runtime)
                        ->getObject();
      children.push_back(shader);
    }
    auto m3 = count < 4 ? nullptr
                        : JsiSkMatrix::fromValue(runtime, arguments[3]).get();

    // Create and return shader as host object
    auto shader = getObject()->makeShader(std::move(uniforms), children.data(),
                                          children.size(), m3, isOpaque);
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkShader>(getContext(), shader));
  }

  JSI_HOST_FUNCTION(getUniformCount) {
    return jsi::Value(getJsNumber(getObject()->uniformSize()));
  }

  JSI_HOST_FUNCTION(getUniformFloatCount) {
    return jsi::Value(getJsNumber(getObject()->uniformSize() / sizeof(float)));
  }

  JSI_HOST_FUNCTION(getUniformName) {
    auto i = arguments[0].asNumber();
    auto it = getObject()->uniforms().begin() + i;
    return jsi::String::createFromUtf8(runtime, it->name.c_str());
  }

  JSI_HOST_FUNCTION(getUniform) {
    auto i = arguments[0].asNumber();
    auto it = getObject()->uniforms().begin() + i;
    auto result = jsi::Object(runtime);
    RuntimeEffectUniform su;
    su.rows = it->count; // arrayLength
    su.columns = 1;
    su.isInteger = false;
    using Type = SkRuntimeEffect::Uniform::Type;
    switch (it->type) {
    case Type::kFloat:
      break;
    case Type::kFloat2:
      su.columns = 2;
      break;
    case Type::kFloat3:
      su.columns = 3;
      break;
    case Type::kFloat4:
      su.columns = 4;
      break;
    case Type::kFloat2x2:
      su.columns = 2;
      su.rows *= 2;
      break;
    case Type::kFloat3x3:
      su.columns = 3;
      su.rows *= 3;
      break;
    case Type::kFloat4x4:
      su.columns = 4;
      su.rows *= 4;
      break;
    case Type::kInt:
      su.isInteger = true;
      break;
    case Type::kInt2:
      su.columns = 2;
      su.isInteger = true;
      break;
    case Type::kInt3:
      su.columns = 3;
      su.isInteger = true;
      break;
    case Type::kInt4:
      su.columns = 4;
      su.isInteger = true;
      break;
    }
    su.slot = (int)(it->offset / sizeof(float));
    result.setProperty(runtime, "columns", su.columns);
    result.setProperty(runtime, "rows", su.rows);
    result.setProperty(runtime, "slot", su.slot);
    return result;
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkRuntimeEffect, makeShader),
                       JSI_EXPORT_FUNC(JsiSkRuntimeEffect,
                                       makeShaderWithChildren),
                       JSI_EXPORT_FUNC(JsiSkRuntimeEffect, getUniformCount),
                       JSI_EXPORT_FUNC(JsiSkRuntimeEffect,
                                       getUniformFloatCount),
                       JSI_EXPORT_FUNC(JsiSkRuntimeEffect, getUniformName),
                       JSI_EXPORT_FUNC(JsiSkRuntimeEffect, getUniform))

  JsiSkRuntimeEffect(std::shared_ptr<RNSkPlatformContext> context,
                     sk_sp<SkRuntimeEffect> rt)
      : JsiSkWrappingSkPtrHostObject<SkRuntimeEffect>(context, rt){};
};
} // namespace RNSkia
