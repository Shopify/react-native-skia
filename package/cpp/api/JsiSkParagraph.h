#pragma once

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include <JsiSkHostObjects.h>
#include <JsiSkPath.h>
#include <JsiSkRect.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "Paragraph.h"
#include "ParagraphBuilder.h"
#include "ParagraphStyle.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

using namespace skia::textlayout; // NOLINT

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

  JSI_HOST_FUNCTION(getHeight) {
    return static_cast<double>(_paragraph->getHeight());
  }

  JSI_HOST_FUNCTION(getMaxWidth) {
    return static_cast<double>(_paragraph->getMaxWidth());
  }

  JSI_HOST_FUNCTION(getLineCount) {
    return static_cast<double>(_paragraph->lineNumber());
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
    auto result = _paragraph->getRectsForRange(
        start, end, RectHeightStyle::kTight, RectWidthStyle::kTight);
    auto returnValue = jsi::Array(runtime, result.size());
    for (size_t i = 0; i < result.size(); ++i) {
      returnValue.setValueAtIndex(
          runtime, i,
          JsiSkRect::toValue(runtime, getContext(), result[i].rect));
    }
    return returnValue;
  }

  JSI_HOST_FUNCTION(getLineNumberAt) {
    auto index =
        static_cast<size_t>(getArgumentAsNumber(runtime, arguments, count, 0));
    return static_cast<double>(_paragraph->getLineNumberAt(index));
  }

  JSI_HOST_FUNCTION(getLineMetrics) {
    std::vector<LineMetrics> metrics;
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

  JSI_HOST_FUNCTION(getPath) {
    auto line = getArgumentAsNumber(runtime, arguments, count, 0);
    SkPath paths;
    _paragraph->getPath(line, &paths);
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), std::move(paths)));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkParagraph, layout),
                       JSI_EXPORT_FUNC(JsiSkParagraph, getMaxWidth),
                       JSI_EXPORT_FUNC(JsiSkParagraph, getHeight),
                       JSI_EXPORT_FUNC(JsiSkParagraph,
                                       getGlyphPositionAtCoordinate),
                       JSI_EXPORT_FUNC(JsiSkParagraph, getRectsForRange),
                       JSI_EXPORT_FUNC(JsiSkParagraph, getLineCount),
                       JSI_EXPORT_FUNC(JsiSkParagraph, getLineNumberAt),
                       JSI_EXPORT_FUNC(JsiSkParagraph, getLineMetrics))

  explicit JsiSkParagraph(std::shared_ptr<RNSkPlatformContext> context,
                          ParagraphBuilder *paragraphBuilder)
      : JsiSkHostObject(std::move(context)) {
    _paragraph = paragraphBuilder->Build();
  }

  Paragraph *getParagraph() { return _paragraph.get(); }

private:
  std::unique_ptr<Paragraph> _paragraph;
};

} // namespace RNSkia
