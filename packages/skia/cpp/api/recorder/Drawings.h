#pragma once

#include <optional>

#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"
#include "Image.h"

namespace RNSkia {

struct CircleCmdProps {
  std::optional<float> cx;
  std::optional<float> cy;
  std::optional<SkPoint> c;
  float r;
};

class CircleCmd : public Command {
private:
  CircleCmdProps props;

public:
  CircleCmd(jsi::Runtime &runtime, const jsi::Object &object,
            Variables &variables)
      : Command(CommandType::DrawCircle) {
    convertProperty(runtime, object, "cx", props.cx, variables);
    convertProperty(runtime, object, "cy", props.cy, variables);
    convertProperty(runtime, object, "c", props.c, variables);
    convertProperty(runtime, object, "r", props.r, variables);
  }

  void draw(DrawingCtx *ctx) {
    auto paint = ctx->getPaint();
    if (props.cx.has_value() && props.cy.has_value()) {
      auto cx = props.cx.value();
      auto cy = props.cy.value();
      auto r = props.r;
      ctx->canvas->drawCircle(cx, cy, r, paint);
    } else if (props.c.has_value()) {
      ctx->canvas->drawCircle(props.c.value(), props.r, paint);
    }
  }
};

struct RectCmdProps {
  float x = 0;
  float y = 0;
  std::optional<float> width;
  std::optional<float> height;
  std::optional<SkRect> rect;
};

class RectCmd : public Command {
private:
  RectCmdProps props;

public:
  RectCmd(jsi::Runtime &runtime, const jsi::Object &object,
          Variables &variables)
      : Command(CommandType::DrawRect) {
    convertProperty(runtime, object, "x", props.x, variables);
    convertProperty(runtime, object, "y", props.y, variables);
    convertProperty(runtime, object, "width", props.width, variables);
    convertProperty(runtime, object, "height", props.height, variables);
    convertProperty(runtime, object, "rect", props.rect, variables);
  }

  void draw(DrawingCtx *ctx) {
    auto [x, y, width, height, rect] = props;
    if (rect.has_value()) {
      ctx->canvas->drawRect(rect.value(), ctx->getPaint());
    } else {
      auto rct = SkRect::MakeXYWH(x, y, width.value(), height.value());
      ctx->canvas->drawRect(rct, ctx->getPaint());
    }
  }
};

struct PathCmdProps {
  SkPath path;
  float start;
  float end;
  std::optional<StrokeOpts> stroke;
  SkPathFillType fillType;
};

class PathCmd : public Command {
private:
  PathCmdProps props;

public:
  PathCmd(jsi::Runtime &runtime, const jsi::Object &object,
          Variables &variables)
      : Command(CommandType::DrawPath) {
    convertProperty(runtime, object, "path", props.path, variables);
    convertProperty(runtime, object, "start", props.start, variables);
    convertProperty(runtime, object, "end", props.end, variables);
    convertProperty(runtime, object, "stroke", props.stroke, variables);
    convertProperty(runtime, object, "fillType", props.fillType, variables);
  }

  void draw(DrawingCtx *ctx) {
    // Saturate start and end values (clamp between 0 and 1)
    float start = std::clamp(props.start, 0.0f, 1.0f);
    float end = std::clamp(props.end, 0.0f, 1.0f);

    // Check conditions that require path mutation
    bool hasStartOffset = start != 0.0f;
    bool hasEndOffset = end != 1.0f;
    bool hasStrokeOptions = props.stroke.has_value();
    bool hasFillType = true; // Since fillType is not optional in the struct
    bool willMutatePath =
        hasStartOffset || hasEndOffset || hasStrokeOptions || hasFillType;

    std::shared_ptr<const SkPath> pathToUse;

    if (willMutatePath) {
      // Create a filtered path for modifications
      SkPath filteredPath(props.path);

      // Handle path trimming
      if (hasStartOffset || hasEndOffset) {
        auto pe =
            SkTrimPathEffect::Make(start, end, SkTrimPathEffect::Mode::kNormal);
        if (pe != nullptr) {
          SkStrokeRec rec(SkStrokeRec::InitStyle::kHairline_InitStyle);
          if (!pe->filterPath(&filteredPath, filteredPath, &rec, nullptr)) {
            throw std::runtime_error(
                "Failed trimming path with parameters start: " +
                std::to_string(start) + ", end: " + std::to_string(end));
          }
          filteredPath.swap(filteredPath);
        } else {
          throw std::runtime_error(
              "Failed trimming path with parameters start: " +
              std::to_string(start) + ", end: " + std::to_string(end));
        }
      }

      // Set fill type
      auto p = std::make_shared<SkPath>(filteredPath);
      p->setFillType(props.fillType);

      // Handle stroke options
      if (hasStrokeOptions) {
        const auto &stroke = props.stroke.value();
        SkPaint strokePaint;

        if (stroke.cap.has_value()) {
          strokePaint.setStrokeCap(stroke.cap.value());
        }

        if (stroke.join.has_value()) {
          strokePaint.setStrokeJoin(stroke.join.value());
        }

        if (stroke.width.has_value()) {
          strokePaint.setStrokeWidth(stroke.width.value());
        }

        if (stroke.miter_limit.has_value()) {
          strokePaint.setStrokeMiter(stroke.miter_limit.value());
        }

        float precision = stroke.precision.value_or(1.0f);

        auto strokedPath = std::make_shared<SkPath>();
        if (!skpathutils::FillPathWithPaint(*p, strokePaint, strokedPath.get(),
                                            nullptr, precision)) {
          throw std::runtime_error("Failed to apply stroke to path");
        }
        pathToUse = std::const_pointer_cast<const SkPath>(strokedPath);
      } else {
        pathToUse = std::const_pointer_cast<const SkPath>(p);
      }
    } else {
      // Use the original path directly
      pathToUse = std::make_shared<const SkPath>(props.path);
    }

    if (!pathToUse) {
      throw std::runtime_error(
          "Path node could not resolve path props correctly.");
    }

    // Draw the final path
    ctx->canvas->drawPath(*pathToUse, ctx->getPaint());
  }
};

struct LineCmdProps {
  SkPoint p1;
  SkPoint p2;
};

class LineCmd : public Command {
private:
  LineCmdProps props;

public:
  LineCmd(jsi::Runtime &runtime, const jsi::Object &object,
          Variables &variables)
      : Command(CommandType::DrawLine) {
    convertProperty(runtime, object, "p1", props.p1, variables);
    convertProperty(runtime, object, "p2", props.p2, variables);
  }

  void draw(DrawingCtx *ctx) {
    ctx->canvas->drawLine(props.p1.x(), props.p1.y(), props.p2.x(),
                          props.p2.y(), ctx->getPaint());
  }
};

struct TextPathProps {
  std::optional<SkFont> font;
  std::string text;
  SkPath path;
  float initialOffset;
};

class TextPathCmd : public Command {
private:
  TextPathProps props;

public:
  TextPathCmd(jsi::Runtime &runtime, const jsi::Object &object,
              Variables &variables)
      : Command(CommandType::DrawTextPath) {
    convertProperty(runtime, object, "font", props.font, variables);
    convertProperty(runtime, object, "text", props.text, variables);
    convertProperty(runtime, object, "path", props.path, variables);
    convertProperty(runtime, object, "initialOffset", props.initialOffset,
                    variables);
  }

  void draw(DrawingCtx *ctx) {
    auto [font, text, path, initialOffset] = props;
    if (font.has_value()) {
      // Get glyphs
      auto numGlyphIds =
          font->countText(text.c_str(), text.length(), SkTextEncoding::kUTF8);

      std::vector<SkGlyphID> glyphIds;
      glyphIds.reserve(numGlyphIds);
      auto ids = font->textToGlyphs(
          text.c_str(), text.length(), SkTextEncoding::kUTF8,
          static_cast<SkGlyphID *>(glyphIds.data()), numGlyphIds);

      // Get glyph widths
      int glyphsSize = static_cast<int>(ids);
      std::vector<SkScalar> widthPtrs;
      widthPtrs.resize(glyphsSize);
      font->getWidthsBounds(glyphIds.data(), numGlyphIds,
                            static_cast<SkScalar *>(widthPtrs.data()), nullptr,
                            nullptr); // TODO: Should we use paint somehow here?

      std::vector<SkRSXform> rsx;
      SkContourMeasureIter meas(path, false, 1);

      auto cont = meas.next();
      auto dist = initialOffset;

      for (size_t i = 0; i < text.length() && cont != nullptr; ++i) {
        auto width = widthPtrs[i];
        dist += width / 2;
        if (dist > cont->length()) {
          // jump to next contour
          cont = meas.next();
          if (cont == nullptr) {
            // We have come to the end of the path - terminate the string
            // right here.
            text = text.substr(0, i);
            break;
          }
          dist = width / 2;
        }
        // Gives us the (x, y) coordinates as well as the cos/sin of the tangent
        // line at that position.
        SkPoint pos;
        SkVector tan;
        if (!cont->getPosTan(dist, &pos, &tan)) {
          throw std::runtime_error(
              "Could not calculate distance when resolving text path");
        }
        auto px = pos.x();
        auto py = pos.y();
        auto tx = tan.x();
        auto ty = tan.y();

        auto adjustedX = px - (width / 2) * tx;
        auto adjustedY = py - (width / 2) * ty;

        rsx.push_back(SkRSXform::Make(tx, ty, adjustedX, adjustedY));
        dist += width / 2;
      }

      auto blob = SkTextBlob::MakeFromRSXform(text.c_str(), text.length(),
                                              rsx.data(), *font);
      ctx->canvas->drawTextBlob(blob, 0, 0, ctx->getPaint());
    }
  }
};

struct TextCmdProps {
  std::optional<SkFont> font;
  std::string text;
  float x;
  float y;
};

class TextCmd : public Command {
private:
  TextCmdProps props;

public:
  TextCmd(jsi::Runtime &runtime, const jsi::Object &object,
          Variables &variables)
      : Command(CommandType::DrawText) {
    convertProperty(runtime, object, "font", props.font, variables);
    convertProperty(runtime, object, "text", props.text, variables);
    convertProperty(runtime, object, "x", props.x, variables);
    convertProperty(runtime, object, "y", props.y, variables);
  }

  void draw(DrawingCtx *ctx) {
    auto [font, text, x, y] = props;
    auto paint = ctx->getPaint();
    if (font.has_value()) {
      ctx->canvas->drawSimpleText(text.c_str(), text.length(),
                                  SkTextEncoding::kUTF8, x, y, font.value(),
                                  paint);
    }
  }
};

// Add to Drawings.h, after existing commands

struct BoxCmdProps {};

class BoxCmd : public Command {
private:
  BoxCmdProps props;

public:
  BoxCmd(jsi::Runtime &runtime, const jsi::Object &object, Variables &variables)
      : Command(CommandType::DrawBox) {}

  void draw(DrawingCtx *ctx) {}
};

struct ImageCmdProps {
  float x = 0;
  float y = 0;
  std::optional<float> width;
  std::optional<float> height;
  std::optional<SkRect> rect;
  std::string fit = "contain";
  std::optional<sk_sp<SkImage>> image;
  SkSamplingOptions sampling = SkSamplingOptions(SkFilterMode::kLinear);
};

class ImageCmd : public Command {
private:
  ImageCmdProps props;

public:
  ImageCmd(jsi::Runtime &runtime, const jsi::Object &object,
           Variables &variables)
      : Command(CommandType::DrawImage) {
    convertProperty(runtime, object, "rect", props.rect, variables);
    convertProperty(runtime, object, "image", props.image, variables);
    convertProperty(runtime, object, "sampling", props.sampling, variables);

    convertProperty(runtime, object, "fit", props.fit, variables);
    convertProperty(runtime, object, "x", props.x, variables);
    convertProperty(runtime, object, "y", props.y, variables);
    convertProperty(runtime, object, "width", props.width, variables);
    convertProperty(runtime, object, "height", props.height, variables);
    convertProperty(runtime, object, "rect", props.rect, variables);
  }

  void draw(DrawingCtx *ctx) {
    auto [x, y, width, height, rect, fit, image, sampling] = props;
    if (image.has_value()) {
      auto img = image.value();
      auto hasRect =
          rect.has_value() || (width.has_value() && height.has_value());
      if (hasRect) {
        auto src = SkRect::MakeXYWH(0, 0, img->width(), img->height());
        auto dst = rect.has_value()
                       ? rect.value()
                       : SkRect::MakeXYWH(x, y, width.value(), height.value());
        auto rects = RNSkiaImage::fitRects(fit, src, dst);
        ctx->canvas->drawImageRect(img, rects.src, rects.dst, sampling,
                                   &(ctx->getPaint()),
                                            SkCanvas::kStrict_SrcRectConstraint);
      } else {
          throw std::runtime_error("Image node could not resolve image dimension props.");
      }
    }
  }
};

struct PointsCmdProps {};

class PointsCmd : public Command {
private:
  PointsCmdProps props;

public:
  PointsCmd(jsi::Runtime &runtime, const jsi::Object &object,
            Variables &variables)
      : Command(CommandType::DrawPoints) {}

  void draw(DrawingCtx *ctx) {}
};

struct RRectCmdProps {};

class RRectCmd : public Command {
private:
  RRectCmdProps props;

public:
  RRectCmd(jsi::Runtime &runtime, const jsi::Object &object,
           Variables &variables)
      : Command(CommandType::DrawRRect) {}

  void draw(DrawingCtx *ctx) {}
};

struct OvalCmdProps {};

class OvalCmd : public Command {
private:
  OvalCmdProps props;

public:
  OvalCmd(jsi::Runtime &runtime, const jsi::Object &object,
          Variables &variables)
      : Command(CommandType::DrawOval) {}

  void draw(DrawingCtx *ctx) {}
};

struct PatchCmdProps {};

class PatchCmd : public Command {
private:
  PatchCmdProps props;

public:
  PatchCmd(jsi::Runtime &runtime, const jsi::Object &object,
           Variables &variables)
      : Command(CommandType::DrawPatch) {}

  void draw(DrawingCtx *ctx) {}
};

struct VerticesCmdProps {};

class VerticesCmd : public Command {
private:
  VerticesCmdProps props;

public:
  VerticesCmd(jsi::Runtime &runtime, const jsi::Object &object,
              Variables &variables)
      : Command(CommandType::DrawVertices) {}

  void draw(DrawingCtx *ctx) {}
};

struct DiffRectCmdProps {};

class DiffRectCmd : public Command {
private:
  DiffRectCmdProps props;

public:
  DiffRectCmd(jsi::Runtime &runtime, const jsi::Object &object,
              Variables &variables)
      : Command(CommandType::DrawDiffRect) {}

  void draw(DrawingCtx *ctx) {}
};

struct TextBlobCmdProps {};

class TextBlobCmd : public Command {
private:
  TextBlobCmdProps props;

public:
  TextBlobCmd(jsi::Runtime &runtime, const jsi::Object &object,
              Variables &variables)
      : Command(CommandType::DrawTextBlob) {}

  void draw(DrawingCtx *ctx) {}
};

struct GlyphsCmdProps {};

class GlyphsCmd : public Command {
private:
  GlyphsCmdProps props;

public:
  GlyphsCmd(jsi::Runtime &runtime, const jsi::Object &object,
            Variables &variables)
      : Command(CommandType::DrawGlyphs) {}

  void draw(DrawingCtx *ctx) {}
};

struct PictureCmdProps {};

class PictureCmd : public Command {
private:
  PictureCmdProps props;

public:
  PictureCmd(jsi::Runtime &runtime, const jsi::Object &object,
             Variables &variables)
      : Command(CommandType::DrawPicture) {}

  void draw(DrawingCtx *ctx) {}
};

struct ImageSVGCmdProps {};

class ImageSVGCmd : public Command {
private:
  ImageSVGCmdProps props;

public:
  ImageSVGCmd(jsi::Runtime &runtime, const jsi::Object &object,
              Variables &variables)
      : Command(CommandType::DrawImageSVG) {}

  void draw(DrawingCtx *ctx) {}
};

struct ParagraphCmdProps {};

class ParagraphCmd : public Command {
private:
  ParagraphCmdProps props;

public:
  ParagraphCmd(jsi::Runtime &runtime, const jsi::Object &object,
               Variables &variables)
      : Command(CommandType::DrawParagraph) {}

  void draw(DrawingCtx *ctx) {}
};

struct AtlasCmdProps {};

class AtlasCmd : public Command {
private:
  AtlasCmdProps props;

public:
  AtlasCmd(jsi::Runtime &runtime, const jsi::Object &object,
           Variables &variables)
      : Command(CommandType::DrawAtlas) {}

  void draw(DrawingCtx *ctx) {}
};

} // namespace RNSkia
