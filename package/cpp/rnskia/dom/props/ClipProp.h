#pragma once

#include "NodeProp.h"

#include "PathProp.h"
#include "RRectProp.h"
#include "RectProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPath.h>

#pragma clang diagnostic pop

namespace RNSkia {

class ClipProp : public BaseDerivedProp {
public:
  ClipProp(PropId name) : BaseDerivedProp() {
    _pathProp = addProperty(std::make_shared<PathProp>(name));
    _rectProp = addProperty(std::make_shared<RectProp>(name));
    _rrectProp = addProperty(std::make_shared<RRectProp>(name));
  }

  void updateDerivedValue() override {
    if (_pathProp->isSet()) {
      _rect = nullptr;
      _rrect = nullptr;
      _path = _pathProp->getDerivedValue();
    } else if (_rrectProp->isSet()) {
      _rect = nullptr;
      _rrect = _rrectProp->getDerivedValue();
      _path = nullptr;
    } else if (_rectProp->isSet()) {
      _rect = _rectProp->getDerivedValue();
      _rrect = nullptr;
      _path = nullptr;
    }
  }

  bool isSet() override {
    return _pathProp->isSet() || _rectProp->isSet() || _rrectProp->isSet();
  }

  void clip(SkCanvas *canvas, bool invert) {
    auto op = invert ? SkClipOp::kDifference : SkClipOp::kIntersect;
    if (_rect != nullptr) {
      canvas->clipRect(*_rect, op, true);
    } else if (_rrect != nullptr) {
      canvas->clipRRect(*_rrect, op, true);
    } else if (_path != nullptr) {
      canvas->clipPath(*_path, op, true);
    }
  }

private:
  PathProp *_pathProp;
  RectProp *_rectProp;
  RRectProp *_rrectProp;

  std::shared_ptr<SkPath> _path;
  std::shared_ptr<SkRect> _rect;
  std::shared_ptr<SkRRect> _rrect;
};

} // namespace RNSkia
