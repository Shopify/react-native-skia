#include "SkiaOpenGLHelper.h"
#include <SkiaOpenGLSurfaceFactory.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/gpu/ganesh/gl/GrGLBackendSurface.h"

#pragma clang diagnostic pop

namespace RNSkia {

thread_local SkiaOpenGLContext ThreadContextHolder::ThreadSkiaOpenGLContext;

sk_sp<SkSurface> SkiaOpenGLSurfaceFactory::makeOffscreenSurface(int width,
                                                                int height) {
  // Setup OpenGL and Skia:
  if (!SkiaOpenGLHelper::createSkiaDirectContextIfNecessary(
          &ThreadContextHolder::ThreadSkiaOpenGLContext)) {

    RNSkLogger::logToConsole(
        "Could not create Skia Surface from native window / surface. "
        "Failed creating Skia Direct Context");
    return nullptr;
  }

  auto colorType = kN32_SkColorType;

  SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

  // Create texture
  auto texture =
      ThreadContextHolder::ThreadSkiaOpenGLContext.directContext
          ->createBackendTexture(width, height, colorType, GrMipMapped::kNo,
                                 GrRenderable::kYes);

  struct ReleaseContext {
    SkiaOpenGLContext *context;
    GrBackendTexture texture;
  };

  auto releaseCtx = new ReleaseContext(
      {&ThreadContextHolder::ThreadSkiaOpenGLContext, texture});

  // Create a SkSurface from the GrBackendTexture
  return SkSurfaces::WrapBackendTexture(
      ThreadContextHolder::ThreadSkiaOpenGLContext.directContext.get(), texture,
      kTopLeft_GrSurfaceOrigin, 0, colorType, nullptr, &props,
      [](void *addr) {
        auto releaseCtx = reinterpret_cast<ReleaseContext *>(addr);

        releaseCtx->context->directContext->deleteBackendTexture(
            releaseCtx->texture);
      },
      releaseCtx);
}

sk_sp<SkSurface> WindowSurfaceHolder::getSurface() {
  if (_skSurface == nullptr) {
    // Setup OpenGL and Skia:
    if (!SkiaOpenGLHelper::createSkiaDirectContextIfNecessary(
            &ThreadContextHolder::ThreadSkiaOpenGLContext)) {

      RNSkLogger::logToConsole(
          "Could not create Skia Surface from native window / surface. "
          "Failed creating Skia Direct Context");
      return nullptr;
    }

    auto colorType = kN32_SkColorType;

    SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

    // Create texture
    auto texture =
        ThreadContextHolder::ThreadSkiaOpenGLContext.directContext
            ->createBackendTexture(_width, _height, colorType, GrMipMapped::kNo,
                                   GrRenderable::kYes);

    struct ReleaseContext {
      SkiaOpenGLContext *context;
      GrBackendTexture texture;
    };

    auto releaseCtx = new ReleaseContext(
        {&ThreadContextHolder::ThreadSkiaOpenGLContext, texture});

    // After creating the texture
    GrGLTextureInfo textureInfo;
    if (GrBackendTextures::GetGLTextureInfo(texture, &textureInfo)) {
      // Now textureInfo.fID contains the OpenGL texture ID
      GLuint textureID = textureInfo.fID;
      // You can use textureID as needed
    }
    _texName = textureInfo.fID;
    RNSkLogger::logToConsole("textureID: %d", textureInfo.fID);
    // Create a SkSurface from the GrBackendTexture
    _skSurface = SkSurfaces::WrapBackendTexture(
        ThreadContextHolder::ThreadSkiaOpenGLContext.directContext.get(),
        texture, kTopLeft_GrSurfaceOrigin, 0, colorType, nullptr, &props,
        [](void *addr) {
          auto releaseCtx = reinterpret_cast<ReleaseContext *>(addr);

          releaseCtx->context->directContext->deleteBackendTexture(
              releaseCtx->texture);
        },
        releaseCtx);
  }
  return _skSurface;
}
} // namespace RNSkia