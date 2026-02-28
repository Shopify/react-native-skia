#pragma once

#include "include/core/SkImage.h"
#include <jsi/jsi.h>

namespace RNSkia {

namespace jsi = facebook::jsi;

class RNSkTypedArray {
public:
  static jsi::Value getTypedArray(jsi::Runtime &runtime,
                                  const jsi::Value &value, SkImageInfo &info) {
    auto reqSize = info.computeMinByteSize();
    if (reqSize > 0) {
      if (value.isObject()) {
        auto typedArray = value.asObject(runtime);
        auto size = static_cast<size_t>(
            typedArray.getProperty(runtime, "byteLength").asNumber());
        if (size >= reqSize) {
          return typedArray;
        }
      } else {
        if (info.colorType() == kAlpha_8_SkColorType ||
            info.colorType() == kRGBA_8888_SkColorType ||
            info.colorType() == kRGB_888x_SkColorType ||
            info.colorType() == kBGRA_8888_SkColorType ||
            info.colorType() == kGray_8_SkColorType ||
            info.colorType() == kR8G8_unorm_SkColorType ||
            info.colorType() == kSRGBA_8888_SkColorType ||
            info.colorType() == kR8_unorm_SkColorType) {

          auto arrayCtor =
              runtime.global().getPropertyAsFunction(runtime, "Uint8Array");
          return arrayCtor.callAsConstructor(runtime,
                                             static_cast<double>(reqSize));
        } else {
          auto arrayCtor =
              runtime.global().getPropertyAsFunction(runtime, "Float32Array");
          return arrayCtor.callAsConstructor(runtime,
                                             static_cast<double>(reqSize / 4));
        }
      }
    }
    return jsi::Value::null();
  }
};

} // namespace RNSkia
