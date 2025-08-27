#pragma once

#include "EGL/egl.h"
#include "GLES2/gl2.h"

#define LOG_EGL_ERROR LogEGLError(__FILE__, __LINE__);

void LogEGLError(const char *file, int line);