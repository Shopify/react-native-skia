#pragma once

#include "NodeProp.h"

#include "PathProp.h"
#include "RRectProp.h"
#include "RectProp.h"

#include <memory>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPath.h>

#pragma clang diagnostic pop

namespace RNSkia {

class ClipProp : public BaseDerivedProp {
public:
  explicit ClipProp(PropId name,
                    const std::function<void(BaseNodeProp *)> &onChange)
      : BaseDerivedProp(onChange) {
    _clipProp = defineProperty<NodeProp>(name);
  }

  void updateDerivedValue() override {
    if (_clipProp->isSet()) {
      auto value = _clipProp->value();
      _rect = nullptr;
      _rrect = nullptr;
      _path = nullptr;
      if (value.getType() == PropType::HostObject) {
        auto rect =
            std::dynamic_pointer_cast<JsiSkRect>(value.getAsHostObject());
        if (rect != nullptr) {
          _rect = rect->getObject();
        } else {
          auto rrect =
              std::dynamic_pointer_cast<JsiSkRRect>(value.getAsHostObject());
          if (rrect != nullptr) {
            _rrect = rrect->getObject();
          } else {
            auto path =
                std::dynamic_pointer_cast<JsiSkPath>(value.getAsHostObject());
            _path = path->getObject();
          }
        }
      } else if (value.getType() == PropType::String) {
        // Read as string
        auto pathString = value.getAsString();
        SkPath path;
        if (SkParsePath::FromSVGString(pathString.c_str(), &path)) {
          _path = std::make_shared<SkPath>(path);
        } else {
          throw std::runtime_error("Could not parse path from string.");
        }
      } else if (value.getType() == PropType::Object) {
        if (value.hasValue(PropNameX) && value.hasValue(PropNameY) &&
            value.hasValue(PropNameWidth) && value.hasValue(PropNameHeight)) {
          // Save props for fast access
          auto x = value.getValue(PropNameX);
          auto y = value.getValue(PropNameY);
          auto width = value.getValue(PropNameWidth);
          auto height = value.getValue(PropNameHeight);
          // Update cache from js object value
          _rect = std::make_shared<SkRect>(
              SkRect::MakeXYWH(x.getAsNumber(), y.getAsNumber(),
                               width.getAsNumber(), height.getAsNumber()));
        } else if (value.hasValue(PropNameX) && value.hasValue(PropNameY) &&
                   value.hasValue(PropNameWidth) &&
                   value.hasValue(PropNameHeight) &&
                   value.hasValue(PropNameRx) && value.hasValue(PropNameRy)) {
          auto x = value.getValue(PropNameX);
          auto y = value.getValue(PropNameY);
          auto width = value.getValue(PropNameWidth);
          auto height = value.getValue(PropNameHeight);
          auto rx = value.getValue(PropNameRx);
          auto ry = value.getValue(PropNameRy);
          // Update cache from js object value
          _rrect = std::make_shared<SkRRect>(SkRRect::MakeRectXY(
              SkRect::MakeXYWH(x.getAsNumber(), y.getAsNumber(),
                               width.getAsNumber(), height.getAsNumber()),
              rx.getAsNumber(), ry.getAsNumber()));
        }
      }
    }
  }

  bool isSet() override { return _clipProp->isSet(); }

  SkPath *getPath() { return _path.get(); }
  SkRect *getRect() { return _rect.get(); }
  SkRRect *getRRect() { return _rrect.get(); }

  std::shared_ptr<SkPath> _path;
  std::shared_ptr<SkRect> _rect;
  std::shared_ptr<SkRRect> _rrect;

private:
  NodeProp *_clipProp;
};

} // namespace RNSkia
