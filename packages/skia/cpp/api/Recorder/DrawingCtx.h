#pragma once

#include "include/core/SkCanvas.h"

namespace RNSkia {

class DrawingCtx {
public:
    DrawingCtx(SkCanvas* canvas) : canvas(canvas) {}

    SkCanvas* canvas;
};
    
} // namespace RNSkia