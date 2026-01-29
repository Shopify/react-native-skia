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
 * Implementation of the Paragraph object in JSI
 */
class JsiSkParagraph
    : public JsiSkWrappingSharedPtrHostObject<para::Paragraph> {
public:
  EXPORT_JSI_API_TYPENAME(JsiSkParagraph, Paragraph)

  JSI_HOST_FUNCTION(layout) {
    auto width = getArgumentAsNumber(runtime, arguments, count, 0);
    getObject()->layout(width);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(paint) {
    auto jsiCanvas =
        getArgumentAsHostObject<JsiSkCanvas>(runtime, arguments, count, 0);
    auto x = getArgumentAsNumber(runtime, arguments, count, 1);
    auto y = getArgumentAsNumber(runtime, arguments, count, 2);
    getObject()->paint(jsiCanvas->getCanvas(), x, y);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(getHeight) {
    return static_cast<double>(getObject()->getHeight());
  }

  JSI_HOST_FUNCTION(getMaxWidth) {
    return static_cast<double>(getObject()->getMaxWidth());
  }

  JSI_HOST_FUNCTION(getMaxIntrinsicWidth) {
    return static_cast<double>(getObject()->getMaxIntrinsicWidth());
  }

  JSI_HOST_FUNCTION(getMinIntrinsicWidth) {
    return static_cast<double>(getObject()->getMinIntrinsicWidth());
  }

  JSI_HOST_FUNCTION(getLongestLine) {
    return static_cast<double>(getObject()->getLongestLine());
  }

  JSI_HOST_FUNCTION(getGlyphPositionAtCoordinate) {
    auto dx = getArgumentAsNumber(runtime, arguments, count, 0);
    auto dy = getArgumentAsNumber(runtime, arguments, count, 1);
    auto result = getObject()->getGlyphPositionAtCoordinate(dx, dy);
    return result.position;
  }

  JSI_HOST_FUNCTION(getRectsForRange) {
    auto start = getArgumentAsNumber(runtime, arguments, count, 0);
    auto end = getArgumentAsNumber(runtime, arguments, count, 1);
    auto result =
        getObject()->getRectsForRange(start, end, para::RectHeightStyle::kTight,
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
    getObject()->getLineMetrics(metrics);
    auto returnValue = jsi::Array(runtime, metrics.size());

    for (size_t i = 0; i < metrics.size(); ++i) {
      auto lineMetrics = jsi::Object(runtime);

      // Text indices
      lineMetrics.setProperty(runtime, "startIndex",
                              static_cast<double>(metrics[i].fStartIndex));
      lineMetrics.setProperty(runtime, "endIndex",
                              static_cast<double>(metrics[i].fEndIndex));
      lineMetrics.setProperty(
          runtime, "endExcludingWhitespaces",
          static_cast<double>(metrics[i].fEndExcludingWhitespaces));
      lineMetrics.setProperty(
          runtime, "endIncludingNewline",
          static_cast<double>(metrics[i].fEndIncludingNewline));

      // Line break info
      lineMetrics.setProperty(runtime, "isHardBreak", metrics[i].fHardBreak);

      // Vertical metrics
      lineMetrics.setProperty(runtime, "ascent",
                              static_cast<double>(metrics[i].fAscent));
      lineMetrics.setProperty(runtime, "descent",
                              static_cast<double>(metrics[i].fDescent));
      lineMetrics.setProperty(runtime, "height",
                              static_cast<double>(metrics[i].fHeight));

      // Horizontal metrics
      lineMetrics.setProperty(runtime, "width",
                              static_cast<double>(metrics[i].fWidth));
      lineMetrics.setProperty(runtime, "left",
                              static_cast<double>(metrics[i].fLeft));

      // Position
      lineMetrics.setProperty(runtime, "baseline",
                              static_cast<double>(metrics[i].fBaseline));

      // Line number
      lineMetrics.setProperty(runtime, "lineNumber",
                              static_cast<double>(metrics[i].fLineNumber));

      returnValue.setValueAtIndex(runtime, i, lineMetrics);
    }
    return returnValue;
  }

  JSI_HOST_FUNCTION(getRectsForPlaceholders) {
    std::vector<para::TextBox> placeholderInfos =
        getObject()->getRectsForPlaceholders();
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

  JSI_HOST_FUNCTION(getGlyphs) {
    std::vector<jsi::Object> runs;

    getObject()->visit([&](int lineNumber, const para::Paragraph::VisitorInfo* info) {
      if (info == nullptr) {
        return; // End of line signal
      }

      auto run = jsi::Object(runtime);
      run.setProperty(runtime, "lineNumber", static_cast<double>(lineNumber));

      // Origin position
      auto origin = jsi::Object(runtime);
      origin.setProperty(runtime, "x", static_cast<double>(info->origin.fX));
      origin.setProperty(runtime, "y", static_cast<double>(info->origin.fY));
      run.setProperty(runtime, "origin", origin);

      // Advance
      run.setProperty(runtime, "advanceX", static_cast<double>(info->advanceX));

      // Glyph IDs
      auto glyphIds = jsi::Array(runtime, info->count);
      for (int i = 0; i < info->count; ++i) {
        glyphIds.setValueAtIndex(runtime, i, static_cast<double>(info->glyphs[i]));
      }
      run.setProperty(runtime, "glyphIds", glyphIds);

      // Positions
      auto positions = jsi::Array(runtime, info->count);
      for (int i = 0; i < info->count; ++i) {
        auto pos = jsi::Object(runtime);
        pos.setProperty(runtime, "x", static_cast<double>(info->positions[i].fX));
        pos.setProperty(runtime, "y", static_cast<double>(info->positions[i].fY));
        positions.setValueAtIndex(runtime, i, pos);
      }
      run.setProperty(runtime, "positions", positions);

      runs.push_back(std::move(run));
    });

    auto returnValue = jsi::Array(runtime, runs.size());
    for (size_t i = 0; i < runs.size(); ++i) {
      returnValue.setValueAtIndex(runtime, i, std::move(runs[i]));
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
                       JSI_EXPORT_FUNC(JsiSkParagraph, getLineMetrics),
                       JSI_EXPORT_FUNC(JsiSkParagraph, getGlyphs),
                       JSI_EXPORT_FUNC(JsiSkParagraph, dispose))

  size_t getMemoryPressure() const override { return 1024 * 1024; }

  std::string getObjectType() const override { return "JsiSkParagraph"; }

  explicit JsiSkParagraph(std::shared_ptr<RNSkPlatformContext> context,
                          para::ParagraphBuilder *paragraphBuilder)
      : JsiSkWrappingSharedPtrHostObject<para::Paragraph>(
            std::move(context), paragraphBuilder->Build()) {}
};

} // namespace RNSkia
