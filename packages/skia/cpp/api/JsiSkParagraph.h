#pragma once

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkCanvas.h"
#include "JsiSkFont.h"
#include "JsiSkNativeObjects.h"
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
    : public JsiSkWrappingSharedPtrNativeObject<JsiSkParagraph,
                                                para::Paragraph> {
public:
  static constexpr const char *CLASS_NAME = "Paragraph";

  JSI_HOST_FUNCTION(layout) {
    auto width = getArgumentAsNumber(runtime, arguments, count, 0);
    getObject()->layout(width);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(paint) {
    auto jsiCanvas = getJsiObject<JsiSkCanvas>(
        runtime, getArgument(runtime, arguments, count, 0));
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

  JSI_HOST_FUNCTION(getPath) {
    auto lineNumber =
        static_cast<int>(getArgumentAsNumber(runtime, arguments, count, 0));
    auto paragraph = getObject();
    // Paragraph::getPath does not bounds-check the line number.
    if (lineNumber < 0 ||
        static_cast<size_t>(lineNumber) >= paragraph->lineNumber()) {
      return jsi::Value::null();
    }
    // Paragraph::getPath resets its path builder after every visual run, so
    // for lines shaped as multiple runs (e.g. through font fallback) it only
    // returns the glyphs of the last run. Build the path from the per-glyph
    // data exposed by extendedVisit instead.
    SkPathBuilder builder;
    paragraph->extendedVisit(
        [lineNumber, &builder](
            int visitedLine, const para::Paragraph::ExtendedVisitorInfo *info) {
          if (visitedLine != lineNumber || info == nullptr) {
            return;
          }
          struct Rec {
            SkPathBuilder *builder;
            SkPoint origin;
            const SkPoint *pos;
          } rec = {&builder, info->origin, info->positions};
          info->font.getPaths(
              {info->glyphs, static_cast<size_t>(info->count)},
              [](const SkPath *src, const SkMatrix &mx, void *ctx) {
                auto *rec = static_cast<Rec *>(ctx);
                if (src != nullptr) {
                  SkMatrix total = mx;
                  total.postTranslate(rec->origin.fX + rec->pos->fX,
                                      rec->origin.fY + rec->pos->fY);
                  rec->builder->addPath(*src, total);
                }
                rec->pos += 1;
              },
              &rec);
        });
    SkPath path = builder.detach();
    return makeJsiObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), std::move(path)));
  }

  JSI_HOST_FUNCTION(extendedVisit) {
    auto visitorObject = getArgumentAsFunction(runtime, arguments, count, 0);
    auto visitor = visitorObject.asFunction(runtime);
    auto context = getContext();
    getObject()->extendedVisit(
        [&runtime, &visitor, &context](
            int lineNumber, const para::Paragraph::ExtendedVisitorInfo *info) {
          if (info == nullptr) {
            // Signals the end of the line
            visitor.call(runtime, static_cast<double>(lineNumber),
                         jsi::Value::null());
            return;
          }
          auto value = jsi::Object(runtime);

          value.setProperty(runtime, "font",
                            makeJsiObject(runtime, std::make_shared<JsiSkFont>(
                                                       context, info->font)));

          auto origin = jsi::Object(runtime);
          origin.setProperty(runtime, "x",
                             static_cast<double>(info->origin.x()));
          origin.setProperty(runtime, "y",
                             static_cast<double>(info->origin.y()));
          value.setProperty(runtime, "origin", origin);

          auto advance = jsi::Object(runtime);
          advance.setProperty(runtime, "width",
                              static_cast<double>(info->advance.width()));
          advance.setProperty(runtime, "height",
                              static_cast<double>(info->advance.height()));
          value.setProperty(runtime, "advance", advance);

          auto size = info->count;
          auto glyphs = jsi::Array(runtime, size);
          auto positions = jsi::Array(runtime, size);
          auto bounds = jsi::Array(runtime, size);
          auto utf8Starts = jsi::Array(runtime, size);
          for (int i = 0; i < size; ++i) {
            glyphs.setValueAtIndex(runtime, i,
                                   static_cast<double>(info->glyphs[i]));
            auto position = jsi::Object(runtime);
            position.setProperty(runtime, "x",
                                 static_cast<double>(info->positions[i].x()));
            position.setProperty(runtime, "y",
                                 static_cast<double>(info->positions[i].y()));
            positions.setValueAtIndex(runtime, i, position);
            bounds.setValueAtIndex(
                runtime, i,
                JsiSkRect::toValue(runtime, context, info->bounds[i]));
            utf8Starts.setValueAtIndex(
                runtime, i, static_cast<double>(info->utf8Starts[i]));
          }
          value.setProperty(runtime, "glyphs", glyphs);
          value.setProperty(runtime, "positions", positions);
          value.setProperty(runtime, "bounds", bounds);
          value.setProperty(runtime, "utf8Starts", utf8Starts);
          value.setProperty(runtime, "flags", static_cast<double>(info->flags));

          visitor.call(runtime, static_cast<double>(lineNumber), value);
        });
    return jsi::Value::undefined();
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

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "layout", &JsiSkParagraph::layout);
    installHostMethod(runtime, prototype, "paint", &JsiSkParagraph::paint);
    installHostMethod(runtime, prototype, "getMaxWidth",
                      &JsiSkParagraph::getMaxWidth);
    installHostMethod(runtime, prototype, "getMinIntrinsicWidth",
                      &JsiSkParagraph::getMinIntrinsicWidth);
    installHostMethod(runtime, prototype, "getMaxIntrinsicWidth",
                      &JsiSkParagraph::getMaxIntrinsicWidth);
    installHostMethod(runtime, prototype, "getLongestLine",
                      &JsiSkParagraph::getLongestLine);
    installHostMethod(runtime, prototype, "getHeight",
                      &JsiSkParagraph::getHeight);
    installHostMethod(runtime, prototype, "getRectsForPlaceholders",
                      &JsiSkParagraph::getRectsForPlaceholders);
    installHostMethod(runtime, prototype, "getGlyphPositionAtCoordinate",
                      &JsiSkParagraph::getGlyphPositionAtCoordinate);
    installHostMethod(runtime, prototype, "getRectsForRange",
                      &JsiSkParagraph::getRectsForRange);
    installHostMethod(runtime, prototype, "getLineMetrics",
                      &JsiSkParagraph::getLineMetrics);
    installHostMethod(runtime, prototype, "getPath", &JsiSkParagraph::getPath);
    installHostMethod(runtime, prototype, "extendedVisit",
                      &JsiSkParagraph::extendedVisit);
  }

  size_t getMemoryPressure() override { return 1024 * 1024; }

  explicit JsiSkParagraph(std::shared_ptr<RNSkPlatformContext> context,
                          para::ParagraphBuilder *paragraphBuilder)
      : JsiSkWrappingSharedPtrNativeObject<JsiSkParagraph, para::Paragraph>(
            std::move(context), paragraphBuilder->Build()) {}
};

} // namespace RNSkia
