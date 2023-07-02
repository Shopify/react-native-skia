// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "Surface.h"

namespace RNSkia {

Surface::Surface(EGLDisplay display, EGLSurface surface)
    : display_(display), surface_(surface) {}

Surface::~Surface() {
  if (surface_ != EGL_NO_SURFACE) {
    if (::eglDestroySurface(display_, surface_) != EGL_TRUE) {
      LOG_EGL_ERROR;
    }
  }
}

const EGLSurface &Surface::GetHandle() const { return surface_; }

bool Surface::IsValid() const { return surface_ != EGL_NO_SURFACE; }

bool Surface::Present() const {
  const auto result = ::eglSwapBuffers(display_, surface_) == EGL_TRUE;
  if (!result) {
    LOG_EGL_ERROR;
  }
  return result;
}

} // namespace RNSkia