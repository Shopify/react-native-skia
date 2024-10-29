#pragma once

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkCanvas.h"

#pragma clang diagnostic pop

class SkiaDawnSurfaceFactory {
  public:
    static sk_sp<SkSurface> makeOffscreenSurface(int width, int height);
};