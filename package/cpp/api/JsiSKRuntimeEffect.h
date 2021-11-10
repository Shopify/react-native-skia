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

enum ShaderType { kShaderType_Shader, kShaderType_ColorFilter };

class JsiSkRuntimeEffect
    : public JsiSkWrappingHostObject<SkRuntimeEffect::Result> {
public:
  JsiSkRuntimeEffect(RNSkPlatformContext *context, const std::string &sksl,
                     const ShaderType &shaderType)
      : JsiSkWrappingHostObject<SkRuntimeEffect::Result>(
            context,
            shaderType == ShaderType::kShaderType_Shader
                ? SkRuntimeEffect::MakeForShader(SkString(sksl))
                : SkRuntimeEffect::MakeForColorFilter(SkString(sksl))) {
    installFunction(
        "makeShader", JSI_FUNC_SIGNATURE {
          auto effect = getObject().effect;
          auto errorText = getObject().errorText;
          if (!effect) {
            jsi::detail::throwJSError(
                runtime,
                std::string("Error in sksl:\n" + std::string(errorText.c_str()))
                    .c_str());
          }

          // Set up arguments - start with Uniforms
          sk_sp<SkData> uniforms;
          if (count >= 1) {
            // Verify uniforms
            auto jsiUniforms = arguments[0].asObject(runtime).asArray(runtime);
            auto jsiUniformsSize = jsiUniforms.size(runtime);

            // verify size of input uniforms
            if (jsiUniformsSize * sizeof(float) != effect->uniformSize()) {
              jsi::detail::throwJSError(
                  runtime, "Uniforms size differs from effect's uniform size.");
            }

            uniforms = SkData::MakeUninitialized(effect->uniformSize());

            // Convert to skia uniforms
            for (int i = 0; i < jsiUniformsSize; i++) {
              // We only support floats for now
              float value = jsiUniforms.getValueAtIndex(runtime, i).asNumber();
              memcpy(SkTAddOffset<void>(uniforms->writable_data(),
                                        i * sizeof(value)),
                     &value, sizeof(value));
            }
          }

          // Children
          std::vector<sk_sp<SkShader>> children;
          if (count >= 2) {
            auto jsiChildren = arguments[1].asObject(runtime).asArray(runtime);
            auto jsiChildCount = jsiChildren.size(runtime);
            for (int i = 0; i < jsiChildCount; i++) {
              auto shader = jsiChildren.getValueAtIndex(runtime, i)
                                .asObject(runtime)
                                .asHostObject<JsiSkShader>(runtime)
                                ->getObject();
              children.push_back(shader);
            }
          }

          // TODO: Local matrix

          // Create and return shader as host object
          auto shader = effect->makeShader(std::move(uniforms), children.data(),
                                           children.size(), nullptr, false);
          return jsi::Object::createFromHostObject(
              runtime, std::make_shared<JsiSkShader>(context, shader));
        });
  }

  /**
   * Creates the function for construction a new instance of the
   * SkRuntimeEffect wrapper
   * @param context Platform context
   * @return A function for creating a new host object wrapper for the
   * SkRuntimeEffect class
   */
  static const jsi::HostFunctionType createCtor(RNSkPlatformContext *context) {
    return JSI_FUNC_SIGNATURE {
      auto sksl = arguments[0].asString(runtime).utf8(runtime);
      auto shaderType = (ShaderType)arguments[1].asNumber();
      // Return the newly constructed object
      return jsi::Object::createFromHostObject(
          runtime, std::make_shared<JsiSkRuntimeEffect>(context, sksl.c_str(),
                                                        shaderType));
    };
  }
};

} // namespace RNSkia
