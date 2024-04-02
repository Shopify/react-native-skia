#pragma once

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkCanvas.h"
#include "JsiSkHostObjects.h"
#include "JsiSkPath.h"
#include "JsiSkRect.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "modules/skparagraph/include/Paragraph.h"
#include "modules/skparagraph/include/ParagraphBuilder.h"
#include "modules/skparagraph/include/ParagraphStyle.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

namespace para = skia::textlayout;

/**
 Implementation of the Paragraph object in JSI
 */
class JsiSkParagraph : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(layout) {
    auto width = getArgumentAsNumber(runtime, arguments, count, 0);
    _paragraph->layout(width);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(paint) {
    auto jsiCanvas =
        getArgumentAsHostObject<JsiSkCanvas>(runtime, arguments, count, 0);
    auto x = getArgumentAsNumber(runtime, arguments, count, 1);
    auto y = getArgumentAsNumber(runtime, arguments, count, 2);
    _paragraph->paint(jsiCanvas->getCanvas(), x, y);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(getHeight) {
    return static_cast<double>(_paragraph->getHeight());
  }

  JSI_HOST_FUNCTION(getMaxWidth) {
    return static_cast<double>(_paragraph->getMaxWidth());
  }

  JSI_HOST_FUNCTION(getMaxIntrinsicWidth) {
    return static_cast<double>(_paragraph->getMaxIntrinsicWidth());
  }

  JSI_HOST_FUNCTION(getMinIntrinsicWidth) {
    return static_cast<double>(_paragraph->getMinIntrinsicWidth());
  }

  JSI_HOST_FUNCTION(getLongestLine) {
    return static_cast<double>(_paragraph->getLongestLine());
  }

  JSI_HOST_FUNCTION(getGlyphPositionAtCoordinate) {
    auto dx = getArgumentAsNumber(runtime, arguments, count, 0);
    auto dy = getArgumentAsNumber(runtime, arguments, count, 1);
    auto result = _paragraph->getGlyphPositionAtCoordinate(dx, dy);
    return result.position;
  }

  JSI_HOST_FUNCTION(getRectsForRange) {
    auto start = getArgumentAsNumber(runtime, arguments, count, 0);
    auto end = getArgumentAsNumber(runtime, arguments, count, 1);
    auto result =
        _paragraph->getRectsForRange(start, end, para::RectHeightStyle::kTight,
                                     para::RectWidthStyle::kTight);
    auto returnValue = jsi::Array(runtime, result.size());
    for (size_t i = 0; i < result.size(); ++i) {
      returnValue.setValueAtIndex(
          runtime, i,
          JsiSkRect::toValue(runtime, getContext(), result[i].rect));
    }
    return returnValue;
  }

  JSI_HOST_FUNCTION(getLineMetrics) {
    std::vector<para::LineMetrics> metrics;
    _paragraph->getLineMetrics(metrics);
    auto returnValue = jsi::Array(runtime, metrics.size());
    auto height = 0;
    for (size_t i = 0; i < metrics.size(); ++i) {
      returnValue.setValueAtIndex(
          runtime, i,
          JsiSkRect::toValue(runtime, getContext(),
                             SkRect::MakeXYWH(metrics[i].fLeft, height,
                                              metrics[i].fWidth,
                                              metrics[i].fHeight)));
      height += metrics[i].fHeight;
    }
    return returnValue;
  }

  JSI_HOST_FUNCTION(getRectsForPlaceholders) {
    std::vector<para::TextBox> placeholderInfos =
        _paragraph->getRectsForPlaceholders();
    auto returnValue = jsi::Array(runtime, placeholderInfos.size());
    for (size_t i = 0; i < placeholderInfos.size(); ++i) {
      auto obj = jsi::Object(runtime);
      obj.setProperty(
          runtime, "rect",
          JsiSkRect::toValue(runtime, getContext(), placeholderInfos[i].rect));
      obj.setProperty(runtime, "direction",
                      static_cast<double>(placeholderInfos[i].direction));
      returnValue.setValueAtIndex(runtime, i, obj);
    }
    return returnValue;
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkParagraph, layout),
                       JSI_EXPORT_FUNC(JsiSkParagraph, paint),
                       JSI_EXPORT_FUNC(JsiSkParagraph, getMaxWidth),
                       JSI_EXPORT_FUNC(JsiSkParagraph, getMinIntrinsicWidth),
                       JSI_EXPORT_FUNC(JsiSkParagraph, getMaxIntrinsicWidth),
                       JSI_EXPORT_FUNC(JsiSkParagraph, getLongestLine),
                       JSI_EXPORT_FUNC(JsiSkParagraph, getHeight),
                       JSI_EXPORT_FUNC(JsiSkParagraph, getRectsForPlaceholders),
                       JSI_EXPORT_FUNC(JsiSkParagraph,
                                       getGlyphPositionAtCoordinate),
                       JSI_EXPORT_FUNC(JsiSkParagraph, getRectsForRange),
                       JSI_EXPORT_FUNC(JsiSkParagraph, getLineMetrics))

  explicit JsiSkParagraph(std::shared_ptr<RNSkPlatformContext> context,
                          para::ParagraphBuilder *paragraphBuilder)
      : JsiSkHostObject(std::move(context)) {
    _paragraph = paragraphBuilder->Build();
  }

  para::Paragraph *getParagraph() { return _paragraph.get(); }

private:
  std::unique_ptr<para::Paragraph> _paragraph;
};

} // namespace RNSkia
