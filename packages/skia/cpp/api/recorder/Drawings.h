#pragma once

#include <optional>

#include "Command.h"
#include "Convertor.h"
#include "DrawingCtx.h"

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

/*
export interface RectCtor {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

export interface RRectCtor extends RectCtor {
  r?: Radius;
}

export type RectDef = RectCtor | { rect: SkRect };
*/

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
      auto rct = SkRect::MakeXYWH(x, y, x + width.value(), y + height.value());
      ctx->canvas->drawRect(rct, ctx->getPaint());
    }
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

} // namespace RNSkia
