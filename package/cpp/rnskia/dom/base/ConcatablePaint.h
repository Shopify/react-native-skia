#pragma once

#include <memory>
#include <vector>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkColorFilter.h"
#include "include/core/SkImageFilter.h"
#include "include/core/SkMaskFilter.h"
#include "include/core/SkPaint.h"
#include "include/core/SkPathEffect.h"
#include "include/core/SkShader.h"

#pragma clang diagnostic pop

namespace RNSkia {

class JsiDomNode;
class PaintProps;
class DeclarationContext;

/**
 Class for concatenating SkPaint objects.
 */
class ConcatablePaint {
public:
  ConcatablePaint(DeclarationContext *context, PaintProps *paintProps,
                  const std::vector<std::shared_ptr<JsiDomNode>> &children);

  void concatTo(std::shared_ptr<SkPaint> paint);
  bool isEmpty();

private:
  DeclarationContext *_declarationContext;
  const std::vector<std::shared_ptr<JsiDomNode>> _children;
  PaintProps *_paintProps;

  bool _isEmpty{true};

  sk_sp<SkImageFilter> _imageFilter;
  sk_sp<SkColorFilter> _colorFilter;
  sk_sp<SkPathEffect> _pathEffect;
  sk_sp<SkMaskFilter> _maskFilter;
  sk_sp<SkShader> _shader;
};

} // namespace RNSkia
