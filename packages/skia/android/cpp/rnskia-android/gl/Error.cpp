#include "gl/Error.h"

#include "RNSkLog.h"

void LogEGLError(const char *file, int line) {
  const auto error = eglGetError();
  RNSkia::RNSkLogger::logToConsole("EGL Error: %s (%d) in %s:%d",
                                   EGLErrorToString(error), error, file, line);
}