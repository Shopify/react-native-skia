#pragma once

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "JsiSkHostObjects.h"
#include "JsiSkMatrix.h"
#include "JsiSkNativeObjects.h"
#include "JsiSkShader.h"

#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/effects/SkRuntimeEffect.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

// Helper to see a bit pattern as a float (w/o aliasing warnings)
static inline float SkBits2Float(uint32_t bits) {
  float value;
  memcpy(&value, &bits, sizeof(float));
  return value;
}

struct RuntimeEffectUniform {
  int columns;
  int rows;
  int slot; // the index into the uniforms array that this uniform begins.
  bool isInteger;
};

class JsiSkRuntimeEffect
    : public JsiSkWrappingSkPtrNativeObject<JsiSkRuntimeEffect,
                                            SkRuntimeEffect> {
public:
  static constexpr const char *CLASS_NAME = "RuntimeEffect";

  JSI_HOST_FUNCTION(makeShader) {
    auto uniforms = castUniforms(runtime, arguments[0]);

    auto matrix =
        count >= 2 && !arguments[1].isUndefined() && !arguments[1].isNull()
            ? JsiSkMatrix::fromValue(runtime, arguments[1]).get()
            : nullptr;

    // Create and return shader as host object
    auto shader =
        getObject()->makeShader(std::move(uniforms), nullptr, 0, matrix);

    return makeJsiObject(runtime, std::make_shared<JsiSkShader>(
                                      getContext(), std::move(shader)));
  }

  JSI_HOST_FUNCTION(makeShaderWithChildren) {
    auto uniforms = castUniforms(runtime, arguments[0]);

    // Children
    std::vector<sk_sp<SkShader>> children;
    auto jsiChildren = arguments[1].asObject(runtime).asArray(runtime);
    auto jsiChildCount = jsiChildren.size(runtime);
    children.reserve(jsiChildCount);
    for (int i = 0; i < jsiChildCount; i++) {
      auto shader = getJsiObject<JsiSkShader>(
                        runtime, jsiChildren.getValueAtIndex(runtime, i))
                        ->getObject();
      children.push_back(shader);
    }

    auto matrix =
        count >= 3 && !arguments[2].isUndefined() && !arguments[2].isNull()
            ? JsiSkMatrix::fromValue(runtime, arguments[2]).get()
            : nullptr;

    // Create and return shader as host object
    auto shader = getObject()->makeShader(std::move(uniforms), children.data(),
                                          children.size(), matrix);

    return makeJsiObject(runtime, std::make_shared<JsiSkShader>(
                                      getContext(), std::move(shader)));
  }

  JSI_HOST_FUNCTION(getUniformCount) {
    return static_cast<int>(getObject()->uniforms().size());
  }

  JSI_HOST_FUNCTION(getUniformFloatCount) {
    return static_cast<int>(getObject()->uniformSize() / sizeof(float));
  }

  JSI_HOST_FUNCTION(getUniformName) {
    auto i = static_cast<int>(arguments[0].asNumber());
    if (i < 0 || i >= getObject()->uniforms().size()) {
      throw jsi::JSError(runtime, "invalid uniform index");
    }
    auto it = getObject()->uniforms().begin() + i;
    return jsi::String::createFromAscii(runtime, std::string(it->name));
  }

  JSI_HOST_FUNCTION(getUniform) {
    auto i = static_cast<int>(arguments[0].asNumber());
    if (i < 0 || i >= getObject()->uniforms().size()) {
      throw jsi::JSError(runtime, "invalid uniform index");
    }
    auto it = getObject()->uniforms().begin() + i;
    auto result = jsi::Object(runtime);
    RuntimeEffectUniform su = fromUniform(*it);
    result.setProperty(runtime, "columns", su.columns);
    result.setProperty(runtime, "rows", su.rows);
    result.setProperty(runtime, "slot", su.slot);
    result.setProperty(runtime, "isInteger", su.isInteger);
    return result;
  }

  JSI_HOST_FUNCTION(source) {
    return jsi::String::createFromAscii(runtime, getObject()->source());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "makeShader",
                      &JsiSkRuntimeEffect::makeShader);
    installHostMethod(runtime, prototype, "makeShaderWithChildren",
                      &JsiSkRuntimeEffect::makeShaderWithChildren);
    installHostMethod(runtime, prototype, "getUniformCount",
                      &JsiSkRuntimeEffect::getUniformCount);
    installHostMethod(runtime, prototype, "getUniformFloatCount",
                      &JsiSkRuntimeEffect::getUniformFloatCount);
    installHostMethod(runtime, prototype, "getUniformName",
                      &JsiSkRuntimeEffect::getUniformName);
    installHostMethod(runtime, prototype, "getUniform",
                      &JsiSkRuntimeEffect::getUniform);
    installHostMethod(runtime, prototype, "source",
                      &JsiSkRuntimeEffect::source);
  }

  JsiSkRuntimeEffect(std::shared_ptr<RNSkPlatformContext> context,
                     sk_sp<SkRuntimeEffect> rt)
      : JsiSkWrappingSkPtrNativeObject<JsiSkRuntimeEffect, SkRuntimeEffect>(
            std::move(context), std::move(rt)) {}

  /**
    Returns the underlying object from a host object of this type
   */
  static sk_sp<SkRuntimeEffect> fromValue(jsi::Runtime &runtime,
                                          const jsi::Value &obj) {
    return getJsiObject<JsiSkRuntimeEffect>(runtime, obj)->getObject();
  }

  size_t getMemoryPressure() override { return 4096; }

  static RuntimeEffectUniform fromUniform(const SkRuntimeEffect::Uniform &u) {
    RuntimeEffectUniform su;
    su.rows = u.count; // arrayLength
    su.columns = 1;
    su.isInteger = false;
    using Type = SkRuntimeEffect::Uniform::Type;
    switch (u.type) {
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
    su.slot = static_cast<int>(u.offset / sizeof(float));
    return su;
  }

private:
  sk_sp<SkData> castUniforms(jsi::Runtime &runtime, const jsi::Value &value) {
    auto jsiUniforms = value.asObject(runtime).asArray(runtime);
    auto jsiUniformsSize = jsiUniforms.size(runtime);

    // verify size of input uniforms
    if (jsiUniformsSize * sizeof(float) != getObject()->uniformSize()) {
      std::string msg =
          "Uniforms size differs from effect's uniform size. Received " +
          std::to_string(jsiUniformsSize) + " expected " +
          std::to_string(getObject()->uniformSize() / sizeof(float));
      throw jsi::JSError(runtime, msg.c_str());
    }

    auto uniforms = SkData::MakeUninitialized(getObject()->uniformSize());

    // Convert to skia uniforms
    const auto &u = getObject()->uniforms();
    for (std::size_t i = 0; i < u.size(); i++) {
      auto it = getObject()->uniforms().begin() + i;
      RuntimeEffectUniform reu = fromUniform(*it);
      for (std::size_t j = 0; j < reu.columns * reu.rows; ++j) {
        const std::size_t offset = reu.slot + j;
        float fValue = jsiUniforms.getValueAtIndex(runtime, offset).asNumber();
        int iValue = static_cast<int>(fValue);
        auto value = reu.isInteger ? SkBits2Float(iValue) : fValue;
        memcpy(SkTAddOffset<void>(uniforms->writable_data(),
                                  offset * sizeof(value)),
               &value, sizeof(value));
      }
    }
    return uniforms;
  }
};
} // namespace RNSkia
