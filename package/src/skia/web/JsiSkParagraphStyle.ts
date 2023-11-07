import type { CanvasKit, InputColor, ParagraphStyle } from "canvaskit-wasm";

import {
  FontSlant,
  FontWeight,
  FontWidth,
  type SkParagraphStyle,
  type SkTextStyle,
  type SkTextAlign,
  type SkTextDirection,
} from "../types";

import { HostObject } from "./Host";

export class JsiSkParagraphStyle
  extends HostObject<ParagraphStyle, "ParagraphStyle">
  implements SkParagraphStyle
{
  constructor(CanvasKit: CanvasKit, ref: ParagraphStyle) {
    super(CanvasKit, ref, "ParagraphStyle");
  }
  setTextStyle(textStyle: SkTextStyle): SkParagraphStyle {
    this.ref.textStyle = {
      backgroundColor: textStyle.getBackgroundColor() as InputColor,
      color: textStyle.getColor() as InputColor,
      fontFamilies: textStyle.getFontFamilies(),
      fontSize: textStyle.getFontSize(),
      letterSpacing: textStyle.getLetterSpacing(),
      wordSpacing: textStyle.getWordSpacing(),
      fontStyle: {
        weight: { value: textStyle.getFontWeight() ?? FontWeight.Normal },
        width: { value: textStyle.getFontWidth() ?? FontWidth.Normal },
        slant: { value: textStyle.getFontSlant() ?? FontSlant.Upright },
      },
      decoration: textStyle.getDecorationStyle(),
      decorationColor: textStyle.getDecorationColor() as InputColor,
      decorationStyle: textStyle.getDecorationStyle()
        ? { value: textStyle.getDecorationStyle() as number }
        : undefined,
      decorationThickness: textStyle.getDecorationThickness(),
      shadows: textStyle.getShadows()?.map((s) => ({
        blurRadius: s.blurRadius,
        color: s.color,
        offset: s.offset ? [s.offset.x, s.offset.y] : undefined,
      })),
    };
    return this;
  }
  setTextDirection(textDirection: SkTextDirection): SkParagraphStyle {
    this.ref.textDirection = { value: textDirection };
    return this;
  }
  setTextAlign(textAlign: SkTextAlign): SkParagraphStyle {
    this.ref.textAlign = { value: textAlign };
    return this;
  }
  setEllipsis(ellipsis: string): SkParagraphStyle {
    this.ref.ellipsis = ellipsis;
    return this;
  }
  setMaxLines(maxLines: number): SkParagraphStyle {
    this.ref.maxLines = maxLines;
    return this;
  }
  dispose() {
    // Do nothing - Paragraph styles are not disposable in CanvasKit
  }
}
