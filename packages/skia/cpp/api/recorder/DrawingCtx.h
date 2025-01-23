#pragma once

#include <include/core/SkCanvas.h>

namespace RNSkia {

class DrawingCtx {
public:
    SkCanvas* canvas;

    DrawingCtx(SkCanvas* aCanvas): canvas(aCanvas) {};
    ~DrawingCtx() = default;
};

} // namespace RNSkia