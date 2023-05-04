import type {
  CanvasKit,
  ParagraphStyle as CKParagraphStyle,
} from "canvaskit-wasm";

import type {
  ParagraphBuilderFactory,
  ParagraphStyle,
} from "../types/Paragraph";
import type { SkTypefaceFontProvider } from "../types/TypefaceFontProvider";

import { ckEnum, Host } from "./Host";
import { JsiSkTypefaceFontProvider } from "./JsiSkTypefaceFontProvider";
import { JsiSkParagraphBuilder, textStyle } from "./JsiSkParagraphBuilder";

const paragraphStyle = (CanvasKit: CanvasKit, style: ParagraphStyle) => {
  const styleCopy = { ...style } as CKParagraphStyle;
  if (style.textAlign) {
    styleCopy.textAlign = ckEnum(style.textAlign);
  }
  if (style.textDirection) {
    styleCopy.textDirection = ckEnum(style.textDirection);
  }
  if (style.textHeightBehavior) {
    styleCopy.textHeightBehavior = ckEnum(style.textHeightBehavior);
  }
  if (style.textStyle) {
    styleCopy.textStyle = textStyle(CanvasKit, style.textStyle);
  }
  return new CanvasKit.ParagraphStyle(styleCopy);
};

export class JsiSkParagraphBuilderFactory
  extends Host
  implements ParagraphBuilderFactory
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeFromFontProvider(style: ParagraphStyle, fontSrc: SkTypefaceFontProvider) {
    const ps = paragraphStyle(this.CanvasKit, style);
    const paragraphBuilder =
      this.CanvasKit.ParagraphBuilder.MakeFromFontProvider(
        ps,
        JsiSkTypefaceFontProvider.fromValue(fontSrc)
      );
    return new JsiSkParagraphBuilder(
      this.CanvasKit,
      paragraphBuilder,
      style.textStyle ?? {}
    );
  }
}
