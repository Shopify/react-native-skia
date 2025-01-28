#pragma once

#include <memory>
#include <vector>

namespace RNSkia {

// Generic composer type using std::function
template <typename T>
using Composer = std::function<sk_sp<T>(sk_sp<T>, sk_sp<T>)>;

// Generic composition function
template <typename T>
using Composer = std::function<sk_sp<T>(sk_sp<T>, sk_sp<T>)>;
// Generic composition function
template <typename T>
sk_sp<T> composeEffects(const std::vector<sk_sp<T>> &effects,
                        const Composer<T> &composer) {
  if (effects.empty()) {
    return nullptr;
  }
  if (effects.size() == 1) {
    return effects[0];
  }
  // Use std::accumulate with reverse iterators to mimic JavaScript's
  // reduceRight
  return std::accumulate(
      std::next(effects.rbegin()), // Start from second-to-last
      effects.rend(),              // End at first
      effects.back(),              // Initial value is last element
      [&composer](const sk_sp<T> &inner, const sk_sp<T> &outer) {
        return inner ? composer(outer, inner) : outer;
      });
}

struct Composers {
  static sk_sp<SkColorFilter> colorFilter(const sk_sp<SkColorFilter> &outer,
                                          const sk_sp<SkColorFilter> &inner) {
    return SkColorFilters::Compose(outer, inner);
  }

  static sk_sp<SkImageFilter> imageFilter(const sk_sp<SkImageFilter> &outer,
                                          const sk_sp<SkImageFilter> &inner) {
    return SkImageFilters::Compose(outer, inner);
  }

  static sk_sp<SkPathEffect> pathEffect(const sk_sp<SkPathEffect> &outer,
                                        const sk_sp<SkPathEffect> &inner) {
    return SkPathEffect::MakeCompose(outer, inner);
  }
};

class DrawingCtx {
public:
  DrawingCtx(SkCanvas *canvas) : canvas(canvas) {
    SkPaint paint;
    paint.setAntiAlias(true);
    paints.push_back(paint);
  }

  void pushPaint(SkPaint &paint) { paints.push_back(paint); }

  void savePaint() { paints.push_back(SkPaint(getPaint())); }

  void saveBackdropFilter() {
    // Initialize image filter as nullptr
    sk_sp<SkImageFilter> imageFilter = nullptr;

    // Try to get image filter first
    if (!imageFilters.empty()) {
      imageFilter = imageFilters.back();
      imageFilters.pop_back();
    } else if (!colorFilters.empty()) {
      // If no image filter, try to create one from color filter
      auto colorFilter = colorFilters.back();
      colorFilters.pop_back();
      imageFilter = SkImageFilters::ColorFilter(colorFilter, nullptr);
    }

    // Save layer with the image filter
    SkPaint layerPaint;
    if (imageFilter) {
      layerPaint.setImageFilter(imageFilter);
    }
    canvas->saveLayer(
        SkCanvas::SaveLayerRec(nullptr, nullptr, imageFilter.get(), 0));
    canvas->restore();
  }

  SkPaint &getPaint() { return paints.back(); }
  const SkPaint &getPaint() const { return paints.back(); }

  SkPaint restorePaint() {
    if (paints.empty()) {
      throw std::runtime_error("No paint available");
    }
    auto paint = paints.back();
    paints.pop_back();
    return paint;
  }

  std::vector<sk_sp<SkShader>> popAllShaders() {
    auto result = std::move(shaders);
    shaders.clear();
    return result;
  }

  void composeImageFilter() {
    if (imageFilters.size() >= 2) {
      auto outer = imageFilters.back();
      imageFilters.pop_back();
      auto inner = imageFilters.back();
      imageFilters.pop_back();

      auto imgf = SkImageFilters::Compose(outer, inner);
      imageFilters.push_back(imgf);
    }
  }

  void composePathEffect() {
    if (pathEffects.size() >= 2) {
      auto outer = pathEffects.back();
      pathEffects.pop_back();
      auto inner = pathEffects.back();
      pathEffects.pop_back();

      auto pe = SkPathEffect::MakeCompose(outer, inner);
      pathEffects.push_back(pe);
    }
  }

  void composeColorFilter() {
    if (colorFilters.size() >= 2) {
      auto outer = colorFilters.back();
      colorFilters.pop_back();
      auto inner = colorFilters.back();
      colorFilters.pop_back();

      auto cf = SkColorFilters::Compose(outer, inner);
      colorFilters.push_back(cf);
    }
  }

  void materializePaint() {
    if (!colorFilters.empty()) {
      getPaint().setColorFilter(
          composeEffects<SkColorFilter>(colorFilters, Composers::colorFilter));
    }

    if (!shaders.empty()) {
      getPaint().setShader(shaders.back());
    }

    if (!maskFilters.empty()) {
      getPaint().setMaskFilter(maskFilters.back());
    }

    if (!imageFilters.empty()) {
      getPaint().setImageFilter(
          composeEffects<SkImageFilter>(imageFilters, Composers::imageFilter));
    }

    // Handle path effects
    if (!pathEffects.empty()) {
      getPaint().setPathEffect(
          composeEffects<SkPathEffect>(pathEffects, Composers::pathEffect));
    }

    // Clear all vectors
    colorFilters.clear();
    shaders.clear();
    imageFilters.clear();
    pathEffects.clear();
    maskFilters.clear();
  }

  SkCanvas *canvas;
  std::vector<SkPaint> paints;
  std::vector<sk_sp<SkMaskFilter>> maskFilters;
  std::vector<sk_sp<SkColorFilter>> colorFilters;
  std::vector<sk_sp<SkShader>> shaders;
  std::vector<sk_sp<SkImageFilter>> imageFilters;
  std::vector<sk_sp<SkPathEffect>> pathEffects;
  std::vector<SkPaint> paintDeclarations;
};

} // namespace RNSkia
