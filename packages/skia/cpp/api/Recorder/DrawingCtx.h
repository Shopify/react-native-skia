#pragma once

#include <stack>

#include "include/core/SkCanvas.h"
#include "include/core/SkColorFilter.h"
#include "include/core/SkImageFilter.h"
#include "include/core/SkPaint.h"
#include "include/core/SkPathEffect.h"
#include "include/core/SkShader.h"

namespace RNSkia {

class DrawingCtx {
private:
  std::stack<SkPaint> paints;
  std::stack<sk_sp<SkColorFilter>> colorFilters;
  std::stack<sk_sp<SkShader>> shaders;
  std::stack<sk_sp<SkImageFilter>> imageFilters;
  std::stack<sk_sp<SkPathEffect>> pathEffects;
  std::stack<SkPaint> paintDeclarations;

public:
  DrawingCtx(SkCanvas *canvas) : canvas(canvas) {
    SkPaint paint;
    paints.push(paint);
  }

  SkCanvas *canvas;

  SkPaint &getPaint() { return paints.top(); }

  void savePaint() {
    SkPaint copy(getPaint());
    paints.push(copy);
  }

  SkPaint restorePaint() {
    auto top = paints.top();
    paints.pop();
    return top;
  }

  void saveBackdropFilter() {
    sk_sp<SkImageFilter> imageFilter = nullptr;
    auto imgf = imageFilters.top();
    imageFilters.pop();
    if (imgf) {
      imageFilter = imgf;
    } else {
      auto cf = colorFilters.top();
      colorFilters.pop();
      if (cf) {
        imageFilter = SkImageFilters::ColorFilter(cf, nullptr);
      }
    }
    canvas->saveLayer(
        SkCanvas::SaveLayerRec(nullptr, nullptr, imageFilter.get(), 0));
    canvas->restore();
  }

  void materializePaint() {}
};

} // namespace RNSkia
