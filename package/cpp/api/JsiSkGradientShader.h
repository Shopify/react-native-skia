#pragma once

#include "JsiSkColorFilter.h"
#include "JsiSkHostObjects.h"
#include <jsi/jsi.h>

#include <SkColorFilter.h>
#include <SkImageFilters.h>

namespace RNSkia {

using namespace facebook;

class JsiSkGradientShaderStatic : public JsiSkHostObject {
public:
  JsiSkGradientShaderStatic(RNSkPlatformContext *context)
      : JsiSkHostObject(context) {
    installFunction(
        "linear", JSI_FUNC_SIGNATURE {
          SkScalar x1 = arguments[0].asNumber();
          SkScalar y1 = arguments[1].asNumber();
          SkScalar x2 = arguments[2].asNumber();
          SkScalar y2 = arguments[3].asNumber();
          SkPoint pts[] = {{x1, y1}, {x2, y2}};

          auto jsiColors = arguments[4].asObject(runtime).asArray(runtime);
          auto size = jsiColors.size(runtime);
          std::vector<SkColor> colors;
          for (int i = 0; i < size; i++) {
            SkColor color = jsiColors.getValueAtIndex(runtime, i).asNumber();
            colors.push_back(color);
          }

          auto jsiPositions = arguments[5].asObject(runtime).asArray(runtime);
          auto positionsSize = jsiPositions.size(runtime);
          std::vector<SkScalar> positions;
          for (int i = 0; i < positionsSize; i++) {
            SkColor color = jsiPositions.getValueAtIndex(runtime, i).asNumber();
            positions.push_back(color);
          }

          auto tileMode = arguments[6].asNumber();

          return jsi::Object::createFromHostObject(
              runtime, std::make_shared<JsiSkShader>(
                           context, SkGradientShader::MakeLinear(
                                        pts, colors.data(), positions.data(),
                                        (int)size, (SkTileMode)tileMode)));
        });
    installFunction(
        "radial", JSI_FUNC_SIGNATURE {
          SkScalar x = arguments[0].asNumber();
          SkScalar y = arguments[1].asNumber();
          SkScalar r = arguments[2].asNumber();
          SkPoint center = {x, y};

          auto jsiColors = arguments[3].asObject(runtime).asArray(runtime);
          auto size = jsiColors.size(runtime);
          std::vector<SkColor> colors;
          for (int i = 0; i < size; i++) {
            SkColor color = jsiColors.getValueAtIndex(runtime, i).asNumber();
            colors.push_back(color);
          }

          auto jsiPositions = arguments[4].asObject(runtime).asArray(runtime);
          auto positionsSize = jsiPositions.size(runtime);
          std::vector<SkScalar> positions;
          for (int i = 0; i < positionsSize; i++) {
            SkColor color = jsiPositions.getValueAtIndex(runtime, i).asNumber();
            positions.push_back(color);
          }

          auto tileMode = arguments[5].asNumber();

          return jsi::Object::createFromHostObject(
              runtime,
              std::make_shared<JsiSkShader>(
                  context, SkGradientShader::MakeRadial(
                               center, r, colors.data(), positions.data(),
                               (int)size, (SkTileMode)tileMode)));
        });
  }
};

} // namespace RNSkia
