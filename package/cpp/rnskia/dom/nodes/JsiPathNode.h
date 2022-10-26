#pragma once

#include "JsiDomDrawingNode.h"
#include "PathProp.h"

#include <memory>
#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkTrimPathEffect.h>

#pragma clang diagnostic pop

namespace RNSkia {

static PropId PropNamePath = JsiPropId::get("path");
static PropId PropNameStart = JsiPropId::get("start");
static PropId PropNameEnd = JsiPropId::get("end");
static PropId PropNameFillType = JsiPropId::get("fillType");
static PropId PropNameMiterLimit = JsiPropId::get("miter_limit");
static PropId PropNameStroke = JsiPropId::get("stroke");
static PropId PropNamePrecision = JsiPropId::get("precision");

class JsiPathNode : public JsiDomDrawingNode,
                    public JsiDomNodeCtor<JsiPathNode> {
public:
  explicit JsiPathNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiDomDrawingNode(context, "skPath") {}

protected:
  void draw(DrawingContext *context) override {
    if (getPropsContainer()->isChanged()) {
      // Can we use the path directly, or do we need to copy to
      // mutate / modify the path?
      auto hasStartOffset =
          _startProp->isSet() && _startProp->value()->getAsNumber() != 0.0;
      auto hasEndOffset =
          _endProp->isSet() && _endProp->value()->getAsNumber() != 1.0;
      auto hasFillStyle = _fillTypeProp->isSet();
      auto hasStrokeOptions =
          _strokeOptsProp->isSet() &&
          _strokeOptsProp->value()->getType() == PropType::Object;

      auto willMutatePath =
          hasStartOffset || hasEndOffset || hasFillStyle || hasStrokeOptions;

      if (willMutatePath) {
        // We'll trim the path
        SkPath filteredPath(*_pathProp->getDerivedValue());
        auto pe = SkTrimPathEffect::Make(_startProp->value()->getAsNumber(),
                                         _endProp->value()->getAsNumber(),
                                         SkTrimPathEffect::Mode::kNormal);

        if (pe != nullptr) {
          SkStrokeRec rec(SkStrokeRec::InitStyle::kHairline_InitStyle);
          if (!pe->filterPath(_pathProp->getDerivedValue().get(), filteredPath,
                              &rec, nullptr)) {
            throw std::runtime_error(
                "Failed trimming path with parameters start: " +
                std::to_string(_startProp->value()->getAsNumber()) +
                ", end: " + std::to_string(_endProp->value()->getAsNumber()));
          }
          _path = std::make_shared<SkPath>(filteredPath);
        } else if (hasStartOffset || hasEndOffset) {
          throw std::runtime_error(
              "Failed trimming path with parameters start: " +
              std::to_string(_startProp->value()->getAsNumber()) +
              ", end: " + std::to_string(_endProp->value()->getAsNumber()));
        } else {
          _path = std::make_shared<SkPath>(*_pathProp->getDerivedValue());
        }

        // Set fill style
        if (_fillTypeProp->isSet()) {
          auto fillType = _fillTypeProp->value()->getAsString();
          _path->setFillType(getFillTypeFromStringValue(fillType));
        }

        // do we have a special paint here?
        if (_strokeOptsProp->isSet()) {
          auto opts = _strokeOptsProp->value();
          SkPaint strokePaint;

          if (opts->hasValue(JsiPropId::get("strokeCap"))) {
            strokePaint.setStrokeCap(StrokeCapProp::getCapFromString(
                opts->getValue(JsiPropId::get("strokeCap"))->getAsString()));
          }

          if (opts->hasValue(JsiPropId::get("strokeJoin"))) {
            strokePaint.setStrokeJoin(StrokeJoinProp::getJoinFromString(
                opts->getValue(JsiPropId::get("strokeJoin"))->getAsString()));
          }

          if (opts->hasValue(PropNameWidth)) {
            strokePaint.setStrokeWidth(
                opts->getValue(PropNameWidth)->getAsNumber());
          }

          if (opts->hasValue(PropNameMiterLimit)) {
            strokePaint.setStrokeMiter(
                opts->getValue(PropNameMiterLimit)->getAsNumber());
          }

          double precision = 1.0;
          if (opts->hasValue(PropNamePrecision)) {
            precision = opts->getValue(PropNamePrecision)->getAsNumber();
          }

          if (!strokePaint.getFillPath(*_path.get(), _path.get(), nullptr,
                                       precision)) {
            _path = nullptr;
          }
        }

      } else {
        // We'll just draw the pure path
        _path = _pathProp->getDerivedValue();
      }
    }

    if (_path == nullptr) {
      throw std::runtime_error(
          "Path node could not resolve path props correctly.");
    }

    context->getCanvas()->drawPath(*_path, *context->getPaint());
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDrawingNode::defineProperties(container);
    _pathProp =
        container->defineProperty(std::make_shared<PathProp>(PropNamePath));
    _startProp =
        container->defineProperty(std::make_shared<NodeProp>(PropNameStart));
    _endProp =
        container->defineProperty(std::make_shared<NodeProp>(PropNameEnd));
    _fillTypeProp =
        container->defineProperty(std::make_shared<NodeProp>(PropNameFillType));
    _strokeOptsProp =
        container->defineProperty(std::make_shared<NodeProp>(PropNameStroke));

    _pathProp->require();
  }

private:
  SkPathFillType getFillTypeFromStringValue(const std::string &value) {
    if (value == "winding") {
      return SkPathFillType::kWinding;
    } else if (value == "evenOdd") {
      return SkPathFillType::kEvenOdd;
    } else if (value == "inverseWinding") {
      return SkPathFillType::kInverseWinding;
    } else if (value == "inverseEvenOdd") {
      return SkPathFillType::kInverseEvenOdd;
    }
    throw std::runtime_error("Could not convert value \"" + value +
                             "\" to path fill type.");
  }

  PathProp *_pathProp;
  NodeProp *_startProp;
  NodeProp *_endProp;
  NodeProp *_fillTypeProp;
  NodeProp *_strokeOptsProp;

  std::shared_ptr<SkPath> _path;
};

class StrokeOptsProps : public BaseDerivedProp {
public:
  StrokeOptsProps() : BaseDerivedProp() {
    _strokeProp = addProperty(std::make_shared<NodeProp>(PropNameStroke));
  }

private:
  NodeProp *_strokeProp;
};

} // namespace RNSkia
