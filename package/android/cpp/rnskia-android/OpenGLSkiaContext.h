#pragma once

#include "RNSKLog.h"

#include "EGL/egl.h"
#include "GLES2/gl2.h"
#include "android/native_window.h"
#include "include/gpu/GrDirectContext.h"
#include "include/gpu/gl/GrGLAssembleInterface.h"
#include "SkSurface.h"

#include "Display.h"

namespace RNSkia {

class OpenGLSkiaContext {
public:
  static OpenGLSkiaContext &getInstance() {
    static OpenGLSkiaContext instance;
    return instance;
  }

  OpenGLSkiaContext(const OpenGLSkiaContext &) = delete;
  OpenGLSkiaContext &operator=(const OpenGLSkiaContext &) = delete;

  sk_sp<SkSurface> MakeOffscreenSurface(int width, int height);
  //   sk_sp<SkSurface> MakeOnscreenSurface(int width, int height,
  //                                        ANativeWindow *window);

private:
  OpenGLSkiaContext();
  ~OpenGLSkiaContext();

  std::unique_ptr<Display> _display = nullptr;
  std::unique_ptr<Config> _config = nullptr;
  std::unique_ptr<Context> _context = nullptr;
  sk_sp<GrDirectContext> _grContext = nullptr;
};

} // namespace RNSkia