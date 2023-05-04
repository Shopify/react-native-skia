import type {
  CanvasKit,
  ParagraphBuilder,
  TextStyle as CKTextStyle,
} from "canvaskit-wasm";

import type { SkPaint } from "../types";
import type {
  PlaceholderAlignment,
  TextBaseline,
  TextStyle,
} from "../types/Paragraph";
import type { SkParagraphBuilder } from "../types/Paragraph/ParagraphBuilder";

import { ckEnum, HostObject, optEnum } from "./Host";
import { JsiSkPaint } from "./JsiSkPaint";
import { JsiSkParagraph } from "./JsiSkParagraph";

export const textStyle = (CanvasKit: CanvasKit, style: TextStyle) => {
  const styleCopy = { ...style } as CKTextStyle;
  if (style.textBaseline !== undefined) {
    styleCopy.textBaseline = ckEnum(style.textBaseline);
  }
  if (style.decorationStyle !== undefined) {
    styleCopy.decorationStyle = ckEnum(style.decorationStyle);
  }
  return new CanvasKit.TextStyle(styleCopy);
};

export class JsiSkParagraphBuilder
  extends HostObject<ParagraphBuilder, "ParagraphBuilder">
  implements SkParagraphBuilder
{
  private textStyles: TextStyle[];

  constructor(CanvasKit: CanvasKit, ref: ParagraphBuilder, ts: TextStyle) {
    super(CanvasKit, ref, "ParagraphBuilder");
    this.textStyles = [ts];
  }

  addPlaceholder(
    width?: number,
    height?: number,
    alignment?: PlaceholderAlignment,
    baseline?: TextBaseline,
    offset?: number
  ) {
    this.ref.addPlaceholder(
      width,
      height,
      optEnum(alignment),
      optEnum(baseline),
      offset
    );
  }

  addText(str: string) {
    this.ref.addText(str);
  }

  build() {
    const p = this.ref.build();
    return new JsiSkParagraph(this.CanvasKit, p);
  }

  pop() {
    this.ref.pop();
    this.textStyles.pop();
  }

  pushStyle(ts: TextStyle) {
    const currentStyle = this.textStyles[this.textStyles.length - 1];
    const style = { ...currentStyle, ...ts };
    this.textStyles.push(style);
    this.ref.pushStyle(textStyle(this.CanvasKit, style));
  }

  pushPaintStyle(ts: TextStyle, fg: SkPaint, bg: SkPaint) {
    const currentStyle = this.textStyles[this.textStyles.length - 1];
    const style = { ...currentStyle, ...ts };
    this.textStyles.push(style);
    this.ref.pushPaintStyle(
      textStyle(this.CanvasKit, style),
      JsiSkPaint.fromValue(fg),
      JsiSkPaint.fromValue(bg)
    );
  }

  reset() {
    this.ref.reset();
  }
}
