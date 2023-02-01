#pragma once

#include "DeclarationsStack.h"

#include <memory>
#include <vector>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkColorFilter.h>
#include <SkImageFilter.h>
#include <SkImageFilters.h>
#include <SkMaskFilter.h>
#include <SkPaint.h>
#include <SkPathEffect.h>
#include <SkShader.h>

#pragma clang diagnostic pop

namespace RNSkia {

class DeclarationContext {
public:
  explicit DeclarationContext()
      : _shaders(
            std::make_unique<DeclarationsStack<SkShader>>()),
        _imageFilters(
            std::make_unique<ComposableDeclarationsStack<SkImageFilter>>(
                [](sk_sp<SkImageFilter> inner, sk_sp<SkImageFilter> outer) {
                  return SkImageFilters::Compose(outer, inner);
                })),
        _colorFilters(
            std::make_unique<ComposableDeclarationsStack<SkColorFilter>>(
                [](sk_sp<SkColorFilter> inner, sk_sp<SkColorFilter> outer) {
                  return SkColorFilters::Compose(outer, inner);
                })),
        _pathEffects(
            std::make_unique<ComposableDeclarationsStack<SkPathEffect>>(
                [](sk_sp<SkPathEffect> inner, sk_sp<SkPathEffect> outer) {
                  return SkPathEffect::MakeCompose(outer, inner);
                })),
        _maskFilters(std::make_unique<DeclarationsStack<SkMaskFilter>>()) {}

  DeclarationContext(DeclarationContext *parent)
      : DeclarationContext() {
    _parent = parent;
    if (_parent != nullptr) {
      _parent->_children.push_back(this);
    }
  }

  DeclarationContext *getParent() { return _parent; }

  DeclarationsStack<SkShader> *getShaders() { return _shaders.get(); }
  ComposableDeclarationsStack<SkImageFilter> *getImageFilters() {
    return _imageFilters.get();
  }
  ComposableDeclarationsStack<SkColorFilter> *getColorFilters() {
    return _colorFilters.get();
  }
  ComposableDeclarationsStack<SkPathEffect> *getPathEffects() {
    return _pathEffects.get();
  }
  DeclarationsStack<SkMaskFilter> *getMaskFilters() {
    return _maskFilters.get();
  }

  void reset() {
    getShaders()->reset();
    getImageFilters()->reset();
    getMaskFilters()->reset();
    getColorFilters()->reset();
    getPathEffects()->reset();
    for (auto child : _children) {
      child->reset();
    }
  }

private:
  DeclarationContext *_parent;
  std::vector<DeclarationContext *> _children;

  std::unique_ptr<DeclarationsStack<SkShader>> _shaders;
  std::unique_ptr<ComposableDeclarationsStack<SkImageFilter>> _imageFilters;
  std::unique_ptr<ComposableDeclarationsStack<SkColorFilter>> _colorFilters;
  std::unique_ptr<ComposableDeclarationsStack<SkPathEffect>> _pathEffects;
  std::unique_ptr<DeclarationsStack<SkMaskFilter>> _maskFilters;
};

} // namespace RNSkia
