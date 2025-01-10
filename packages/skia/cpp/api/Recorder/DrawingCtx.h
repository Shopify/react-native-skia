#pragma once

#include "include/core/SkCanvas.h"
#include "include/core/SkColorFilter.h"
#include "include/core/SkImageFilter.h"
#include "include/core/SkPaint.h"
#include "include/core/SkPathEffect.h"
#include "include/core/SkShader.h"

namespace RNSkia {

class DrawingCtx {
private:
  std::stack<std::shared_ptr<SkPaint>> paints;
  std::stack<sk_sp<SkColorFilter>> colorFilters;
  std::stack<sk_sp<SkShader>> shaders;
  std::stack<sk_sp<SkImageFilter>> imageFilters;
  std::stack<sk_sp<SkPathEffect>> pathEffects;
  std::stack<std::shared_ptr<SkPaint>> paintDeclarations;

public:
  DrawingCtx(SkCanvas *canvas) : canvas(canvas) {}

  SkCanvas *canvas;

  std::shared_ptr<SkPaint> getPaint() { return paints.top(); }

  void savePaint() { paints.push(std::make_shared<SkPaint>(*getPaint())); }

  std::shared_ptr<SkPaint> restorePaint() {
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
        imageFilter = SkImageFilter::MakeColorFilter(cf);
      }
    }
    canvas->saveLayer(nullptr, nullptr, imageFilter);
    canvas->restore();
  }

  void materializePaint() {
    // Color Filters
    if (colorFilters.size() > 0) {
      getPaint()->setColorFilter(std::accumulate(
          colorFilters.begin(), colorFilters.end(), nullptr,
          [](sk_sp<SkColorFilter> inner, sk_sp<SkColorFilter> outer) {
            return inner ? SkColorFilter::MakeCompose(outer, inner) : outer;
          }));
    }
    // Shaders
    if (shaders.size() > 0) {
      getPaint()->setShader(shaders.top());
    }
    // Image Filters
    if (imageFilters.size() > 0) {
      getPaint()->setImageFilter(std::accumulate(
          imageFilters.begin(), imageFilters.end(), nullptr,
          [](sk_sp<SkImageFilter> inner, sk_sp<SkImageFilter> outer) {
            return inner ? SkImageFilter::MakeCompose(outer, inner) : outer;
          }));
    }
    // Path Effects
    if (pathEffects.size() > 0) {
      getPaint()->setPathEffect(std::accumulate(
          pathEffects.begin(), pathEffects.end(), nullptr,
          [](sk_sp<SkPathEffect> inner, sk_sp<SkPathEffect> outer) {
            return inner ? SkPathEffect::MakeCompose(outer, inner) : outer;
          }));
    }
  }
};

} // namespace RNSkia
