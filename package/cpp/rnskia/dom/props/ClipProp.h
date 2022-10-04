#pragma once

#include "PathProp.h"
#include "RectProp.h"
#include "RRectProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPath.h>

#pragma clang diagnostic pop

namespace RNSkia {

class ClipProp: public JsiBaseDerivedProp {
public:
  ClipProp(PropId name): JsiBaseDerivedProp(), _name(name) {
    _pathProp = addChildProp(std::make_shared<PathProp>(name));
    _rectProp = addChildProp(std::make_shared<RectProp>(name));
    _rrectProp = addChildProp(std::make_shared<RRectProp>(name));
  }
  
  void updateDerivedValue(NodePropsContainer* props) override {
    if (props->getHasPropChanges(_name)) {
      if (_pathProp->hasValue()) {
        _rect = nullptr;
        _rrect = nullptr;
        _path = _pathProp->getDerivedValue();
      } else if (_rectProp->hasValue()) {
        _rect = std::make_shared<SkRect>(_rectProp->getDerivedValue());
        _rrect = nullptr;
        _path = nullptr;
      } else if (_rrectProp->hasValue()) {
        _rect = nullptr;
        _rrect = std::make_shared<SkRRect>(_rrectProp->getDerivedValue());
        _path = nullptr;
      }
    }
  }
  
  void clip(SkCanvas* canvas, SkClipOp op) {
    if (_rect != nullptr) {
      canvas->clipRect(*_rect, op, true);
    } else if (_rrect != nullptr) {
      canvas->clipRRect(*_rrect, op, true);
    } else if (_path != nullptr) {
      canvas->clipPath(*_path, op, true);
    }
  }

  
private:
  std::shared_ptr<PathProp> _pathProp;
  std::shared_ptr<RectProp> _rectProp;
  std::shared_ptr<RRectProp> _rrectProp;
  
  PropId _name;
  
  std::shared_ptr<SkPath> _path;
  std::shared_ptr<SkRect> _rect;
  std::shared_ptr<SkRRect> _rrect;
};

}

