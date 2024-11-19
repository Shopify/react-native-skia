#pragma once

#include "EGL/egl.h"
#include "GLES2/gl2.h"

#define LOG_EGL_ERROR LogEGLError(__FILE__, __LINE__);

static const char *EGLErrorToString(EGLint error) {
  switch (error) {
  case EGL_SUCCESS:
    return "Success";
  case EGL_NOT_INITIALIZED:
    return "Not Initialized";
  case EGL_BAD_ACCESS:
    return "Bad Access";
  case EGL_BAD_ALLOC:
    return "Bad Alloc";
  case EGL_BAD_ATTRIBUTE:
    return "Bad Attribute";
  case EGL_BAD_CONTEXT:
    return "Bad Context";
  case EGL_BAD_CONFIG:
    return "Bad Config";
  case EGL_BAD_CURRENT_SURFACE:
    return "Bad Current Surface";
  case EGL_BAD_DISPLAY:
    return "Bad Display";
  case EGL_BAD_SURFACE:
    return "Bad Surface";
  case EGL_BAD_MATCH:
    return "Bad Match";
  case EGL_BAD_PARAMETER:
    return "Bad Parameter";
  case EGL_BAD_NATIVE_PIXMAP:
    return "Bad Native Pixmap";
  case EGL_BAD_NATIVE_WINDOW:
    return "Bad Native Window";
  case EGL_CONTEXT_LOST:
    return "Context Lost";
  }
  return "Unknown";
}

void LogEGLError(const char *file, int line);