#pragma once

#include "NodeProp.h"

#include <memory>
#include <utility>

namespace RNSkia {

class BoxShadowProps : public DerivedProp<SkPaint> {
public:
  explicit BoxShadowProps(PropertyDidUpdateCallback &propertyDidUpdate)
      : DerivedProp<SkPaint>(propertyDidUpdate) {
    _dxProp = addProperty<NodeProp>("dx");
    _dyProp = addProperty<NodeProp>("dy");
    _spreadProp = addProperty<NodeProp>("spread");
    _blurProp = addProperty<NodeProp>("blur");
    _colorProp = addProperty<ColorProp>("color");
    _innerProp = addProperty<NodeProp>("inner");

    _blurProp->require();
  }

  void updateDerivedValue() override {
    SkColor color =
        _colorProp->isSet() ? *_colorProp->getDerivedValue() : SK_ColorBLACK;
    SkScalar blur = _blurProp->value().getAsNumber();

    auto paint = SkPaint();
    paint.setAntiAlias(true);
    paint.setColor(color);
    auto filter = SkMaskFilter::MakeBlur(kNormal_SkBlurStyle, blur, true);
    paint.setMaskFilter(filter);

    setDerivedValue(std::move(paint));
  }

  bool isInner() {
    return _innerProp->isSet() ? _innerProp->value().getAsBool() : false;
  }
  SkScalar getDx() {
    return _dxProp->isSet() ? _dxProp->value().getAsNumber() : 0;
  }
  SkScalar getDy() {
    return _dyProp->isSet() ? _dyProp->value().getAsNumber() : 0;
  }
  SkScalar getSpread() {
    return _spreadProp->isSet() ? _spreadProp->value().getAsNumber() : 0;
  }

private:
  NodeProp *_dxProp;
  NodeProp *_dyProp;
  NodeProp *_spreadProp;
  NodeProp *_blurProp;
  ColorProp *_colorProp;
  NodeProp *_innerProp;
};

} // namespace RNSkia
