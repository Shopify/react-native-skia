#pragma once

#include <optional>

#include "gltoolkit/Macros.h"
/*
#include "impeller/base/comparable.h"
#include "impeller/base/thread.h"
*/
#include "Proc.h"
#include "Surface.h"

namespace RNSkia {

class Context {
public:
  Context(EGLDisplay display, EGLContext context);

  ~Context();

  bool IsValid() const;

  const EGLContext &GetHandle() const;

  bool MakeCurrent(const Surface &surface) const;

  bool ClearCurrent() const;

private:
  EGLDisplay display_ = EGL_NO_DISPLAY;
  EGLContext context_ = EGL_NO_CONTEXT;

  DISALLOW_COPY_AND_ASSIGN(Context);
};

} // namespace RNSkia