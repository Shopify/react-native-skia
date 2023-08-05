// Based on https://github.com/flutter/engine/tree/main/impeller/toolkit/egl
#pragma once

#include <EGL/egl.h>

#include <functional>

namespace RNSkia {

std::function<void *(const char *)> CreateProcAddressResolver();

#define LOG_EGL_ERROR LogEGLError(__FILE__, __LINE__);

void LogEGLError(const char *file, int line);

} // namespace RNSkia