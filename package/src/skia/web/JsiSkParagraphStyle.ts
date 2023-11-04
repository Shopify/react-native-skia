import {
  FontSlant,
  FontWeight,
  FontWidth,
  type SkParagraphStyle,
  type SkTextStyle,
  type TextAlign,
  type TextDirection,
} from "../types";

import type { CanvasKit, InputColor, ParagraphStyle } from "canvaskit-wasm";

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
      foregroundColor: textStyle.getForegroundColor() as InputColor,
      fontFamilies: textStyle.getFontFamilies(),
      fontSize: textStyle.getFontSize(),
      letterSpacing: textStyle.getLetterSpacing(),
      wordSpacing: textStyle.getWordSpacing(),
      fontStyle: {
        weight: { value: textStyle.getFontWeight() ?? FontWeight.Normal },
        width: { value: textStyle.getFontWidth() ?? FontWidth.Normal },
        slant: { value: textStyle.getFontSlant() ?? FontSlant.Upright },
      },
    };
    return this;
  }
  setTextDirection(textDirection: TextDirection): SkParagraphStyle {
    this.ref.textDirection = { value: textDirection };
    return this;
  }
  setTextAlign(textAlign: TextAlign): SkParagraphStyle {
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
