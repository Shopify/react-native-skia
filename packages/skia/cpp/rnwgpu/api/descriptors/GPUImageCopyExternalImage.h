#pragma once

#include <memory>
#include <optional>
#include <variant>
#include <vector>

#include "webgpu/webgpu_cpp.h"

#include "Convertors.h"
#include "jsi2/JSIConverter.h"

#include "GPUOrigin2D.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUImageCopyExternalImage {
  //std::shared_ptr<ImageBitmap> source; // GPUImageCopyExternalImageSource
  std::optional<std::shared_ptr<GPUOrigin2D>> origin; // GPUOrigin2DStrict
  std::optional<bool> flipY;                          // boolean
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUImageCopyExternalImage>> {
  static std::shared_ptr<rnwgpu::GPUImageCopyExternalImage>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUImageCopyExternalImage>();
    if (!outOfBounds && arg.isObject()) {
      auto obj = arg.getObject(runtime);
//      if (obj.hasProperty(runtime, "source")) {
//        auto prop = obj.getProperty(runtime, "source");
//        result->source = JSIConverter<std::shared_ptr<ImageBitmap>>::fromJSI(
//            runtime, prop, false);
//      }
      if (obj.hasProperty(runtime, "origin")) {
        auto prop = obj.getProperty(runtime, "origin");
        result->origin = JSIConverter<std::shared_ptr<GPUOrigin2D>>::fromJSI(
            runtime, prop, false);
      }

      if (obj.hasProperty(runtime, "flipY")) {
        auto prop = obj.getProperty(runtime, "flipY");
        result->flipY = JSIConverter<bool>::fromJSI(runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value
  toJSI(jsi::Runtime &runtime,
        std::shared_ptr<rnwgpu::GPUImageCopyExternalImage> arg) {
    throw std::runtime_error("Invalid GPUImageCopyExternalImage::toJSI()");
  }
};

} // namespace rnwgpu
