#pragma once

#include "include/core/SkBlender.h"
#include "include/core/SkPaint.h"
#include "include/core/SkString.h"
#include "include/effects/SkRuntimeEffect.h"

namespace RNSkia {

// Custom blend mode values (must match TypeScript BlendMode enum)
constexpr int kBlendModePlusDarker = 1001;
constexpr int kBlendModePlusLighter = 1002;

// SkSL for PlusDarker blend mode
// Formula: rc = max(0, 1 - ((1-dst) + (1-src))) = max(0, src + dst - 1)
// This darkens the image by subtracting from white
inline const char *kPlusDarkerSkSL = R"(
    vec4 main(vec4 src, vec4 dst) {
        float outAlpha = src.a + dst.a - src.a * dst.a;
        vec3 srcUnpremul = src.a > 0.0 ? src.rgb / src.a : vec3(0.0);
        vec3 dstUnpremul = dst.a > 0.0 ? dst.rgb / dst.a : vec3(0.0);
        vec3 blended = max(vec3(0.0), srcUnpremul + dstUnpremul - vec3(1.0));
        return vec4(blended * outAlpha, outAlpha);
    }
)";

// SkSL for PlusLighter blend mode
// Formula: rc = min(1, dst + src)
// This lightens the image by adding colors and clamping
inline const char *kPlusLighterSkSL = R"(
    vec4 main(vec4 src, vec4 dst) {
        float outAlpha = src.a + dst.a - src.a * dst.a;
        vec3 srcUnpremul = src.a > 0.0 ? src.rgb / src.a : vec3(0.0);
        vec3 dstUnpremul = dst.a > 0.0 ? dst.rgb / dst.a : vec3(0.0);
        vec3 blended = min(vec3(1.0), srcUnpremul + dstUnpremul);
        return vec4(blended * outAlpha, outAlpha);
    }
)";

// Singleton class to cache custom blenders
class CustomBlenders {
public:
  static CustomBlenders &getInstance() {
    static CustomBlenders instance;
    return instance;
  }

  sk_sp<SkBlender> getPlusDarkerBlender() {
    // Function-local static: initialization is thread-safe, and paints can
    // be built concurrently from the JS thread and the Reanimated UI runtime.
    static const sk_sp<SkBlender> blender = makeBlender(kPlusDarkerSkSL);
    return blender;
  }

  sk_sp<SkBlender> getPlusLighterBlender() {
    static const sk_sp<SkBlender> blender = makeBlender(kPlusLighterSkSL);
    return blender;
  }

private:
  CustomBlenders() = default;
  ~CustomBlenders() = default;
  CustomBlenders(const CustomBlenders &) = delete;
  CustomBlenders &operator=(const CustomBlenders &) = delete;

  static sk_sp<SkBlender> makeBlender(const char *sksl) {
    auto [effect, err] = SkRuntimeEffect::MakeForBlender(SkString(sksl));
    return effect ? effect->makeBlender(nullptr) : nullptr;
  }
};

// Helper function to apply custom blend mode to a paint
inline void applyBlendMode(SkPaint &paint, int blendModeValue) {
  if (blendModeValue == kBlendModePlusDarker) {
    auto blender = CustomBlenders::getInstance().getPlusDarkerBlender();
    if (blender) {
      paint.setBlender(blender);
    }
  } else if (blendModeValue == kBlendModePlusLighter) {
    auto blender = CustomBlenders::getInstance().getPlusLighterBlender();
    if (blender) {
      paint.setBlender(blender);
    }
  } else {
    paint.setBlendMode(static_cast<SkBlendMode>(blendModeValue));
  }
}

} // namespace RNSkia
