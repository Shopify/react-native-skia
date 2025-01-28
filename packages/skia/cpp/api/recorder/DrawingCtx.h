#pragma once
#include <memory>
#include <vector>

class DrawingCtx {
public:
  DrawingCtx(SkCanvas *canvas) : canvas(canvas) {
    SkPaint paint;
    paint.setAntiAlias(true);
    paints.push_back(paint);
    nextPaintIndex++;
  }

  void savePaint() {
    paints.push_back(SkPaint(getPaint()));
    nextPaintIndex++;
  }

  //  void saveBackdropFilter() {
  //    SkImageFilter *imageFilter = nullptr;
  //    if (!imageFilters.empty()) {
  //      imageFilter = imageFilters.back();
  //      imageFilters.pop_back();
  //    } else if (!colorFilters.empty()) {
  //      auto cf = colorFilters.back();
  //      colorFilters.pop_back();
  //      imageFilter = skia->ImageFilter_MakeColorFilter(cf, nullptr);
  //    }
  //    canvas->saveLayer(nullptr, nullptr, imageFilter);
  //    canvas->restore();
  //  }

  SkPaint &getPaint() { return paints.back(); }
  const SkPaint &getPaint() const { return paints.back(); }

  SkPaint &&restorePaint() {
    if (paints.empty()) {
      throw std::runtime_error("No paint available");
    }
    auto &&paint = std::move(paints.back());
    paints.pop_back();
    return std::move(paint);
  }

  std::vector<sk_sp<SkShader>> popAllShaders() {
    auto result = std::move(shaders);
    shaders.clear();
    return result;
  }

  void materializePaint() {
    if (!colorFilters.empty()) {
      sk_sp<SkColorFilter> result = nullptr;
      for (auto it = colorFilters.rbegin(); it != colorFilters.rend(); ++it) {
        if (!result)
          result = *it;
        else
          result = SkColorFilters::Compose(*it, result);
      }
      getPaint().setColorFilter(result);
    }

    if (!shaders.empty()) {
      getPaint().setShader(shaders.back());
    }
    if (!maskFilters.empty()) {
      getPaint().setMaskFilter(maskFilters.back());
    }

    if (!imageFilters.empty()) {
      sk_sp<SkImageFilter> result = nullptr;
      for (auto it = imageFilters.rbegin(); it != imageFilters.rend(); ++it) {
        if (!result) {
          result = *it;
        } else {
          result = SkImageFilters::Compose(*it, result);
        }
      }
      getPaint().setImageFilter(result);
    }

    if (!pathEffects.empty()) {
      sk_sp<SkPathEffect> result = nullptr;
      for (auto it = pathEffects.rbegin(); it != pathEffects.rend(); ++it) {
        if (!result) {
          result = *it;
        } else {
          result = SkPathEffect::MakeCompose(*it, result);
        }
      }
      getPaint().setPathEffect(result);
    }

    colorFilters.clear();
    shaders.clear();
    imageFilters.clear();
    pathEffects.clear();
  }

  SkCanvas *canvas;
  std::vector<SkPaint> paints;
  std::vector<sk_sp<SkMaskFilter>> maskFilters;
  std::vector<sk_sp<SkColorFilter>> colorFilters;
  std::vector<sk_sp<SkShader>> shaders;
  std::vector<sk_sp<SkImageFilter>> imageFilters;
  std::vector<sk_sp<SkPathEffect>> pathEffects;
  // std::vector<SkPaint *> paintDeclarations;

private:
  size_t nextPaintIndex = 0;
};
