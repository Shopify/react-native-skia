#pragma once

#include <memory>
#include <utility>
#include <variant>

#include <jsi/jsi.h>

#include "JsiSkNativeObjects.h"

#include "JsiSkSurface.h"

#ifdef SK_GRAPHITE
#include "rnskia/RNDawnContext.h"
#endif

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkSurface.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkSurfaceFactory : public JsiSkNativeObject<JsiSkSurfaceFactory> {
public:
  static constexpr const char *CLASS_NAME = "SurfaceFactory";

  std::variant<std::nullptr_t, std::shared_ptr<JsiSkSurface>> Make(int width,
                                                                   int height) {
    auto imageInfo = SkImageInfo::MakeN32Premul(width, height);
    auto surface = SkSurfaces::Raster(imageInfo);
    if (surface == nullptr) {
      return nullptr;
    }
    return std::make_shared<JsiSkSurface>(getContext(), std::move(surface));
  }

  JSI_HOST_FUNCTION(MakeOffscreen) {
    auto width = static_cast<int>(arguments[0].asNumber());
    auto height = static_cast<int>(arguments[1].asNumber());
    bool useP3ColorSpace = false;
    if (count >= 3 && arguments[2].isObject()) {
      auto opts = arguments[2].asObject(runtime);
      if (opts.hasProperty(runtime, "colorSpace")) {
        auto colorSpaceVal = opts.getProperty(runtime, "colorSpace");
        if (colorSpaceVal.isString()) {
          useP3ColorSpace =
              colorSpaceVal.asString(runtime).utf8(runtime) == "display-p3";
        }
      }
    }
    auto context = getContext();
    auto surface =
        context->makeOffscreenSurface(width, height, useP3ColorSpace);
    if (surface == nullptr) {
      return jsi::Value::null();
    }
    return makeJsiObject(runtime, std::make_shared<JsiSkSurface>(
                                      getContext(), std::move(surface)));
  }

  // Pointer-based texture interop with react-native-webgpu, the surface
  // counterpart of JsiSkImageFactory::MakeImageFromNativeTexture: Skia draws
  // directly into a texture created on the shared device, so WebGPU can
  // sample what Skia drew without any copy.
  JSI_HOST_FUNCTION(MakeFromNativeTexture) {
#ifdef SK_GRAPHITE
    if (count < 1 || !arguments[0].isBigInt()) {
      throw std::runtime_error("MakeFromNativeTexture requires a WGPUTexture "
                               "pointer (BigInt), e.g. texture.nativePointer");
    }
    auto raw = reinterpret_cast<WGPUTexture>(
        arguments[0].asBigInt(runtime).asUint64(runtime));
    if (raw == nullptr) {
      throw std::runtime_error(
          "MakeFromNativeTexture: pointer must be non-null");
    }
    // Borrow: AddRef so our wgpu::Texture holds its own reference; the
    // surface retains the texture for its lifetime and the caller keeps
    // ownership of the JS GPUTexture.
    wgpuTextureAddRef(raw);
    wgpu::Texture texture = wgpu::Texture::Acquire(raw);
    auto surface = DawnContext::getInstance().MakeSurfaceFromTexture(texture);
    if (surface == nullptr) {
      throw std::runtime_error(
          "MakeFromNativeTexture: failed to wrap the texture");
    }
    return makeJsiObject(runtime, std::make_shared<JsiSkSurface>(
                                      getContext(), std::move(surface)));
#else
    throw std::runtime_error(
        "MakeFromNativeTexture is only available with the Graphite backend. "
        "Rebuild with SK_GRAPHITE enabled.");
#endif
  }

  size_t getMemoryPressure() override { return 2048; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installMethod(runtime, prototype, "Make", &JsiSkSurfaceFactory::Make);
    installHostMethod(runtime, prototype, "MakeOffscreen",
                      &JsiSkSurfaceFactory::MakeOffscreen);
    installHostMethod(runtime, prototype, "MakeFromNativeTexture",
                      &JsiSkSurfaceFactory::MakeFromNativeTexture);
  }

  explicit JsiSkSurfaceFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkNativeObject<JsiSkSurfaceFactory>(std::move(context)) {}
};

} // namespace RNSkia
