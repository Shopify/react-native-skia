import type { CanvasKit } from "canvaskit-wasm";

import type {
  ParagraphBuilderFactory,
  SkParagraphBuilder,
  SkParagraphStyle,
  SkTypefaceFontProvider,
} from "../types";

import { Host, NotImplementedOnRNWeb } from "./Host";
import { JsiSkParagraphBuilder } from "./JsiSkParagraphBuilder";
import { JsiSkParagraphStyle } from "./JsiSkParagraphStyle";
import { JsiSkTypeface } from "./JsiSkTypeface";

export class JsiSkParagraphBuilderFactory
  extends Host
  implements ParagraphBuilderFactory
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeFromFontProvider(
    typefaceProvider: SkTypefaceFontProvider,
    paragraphStyle?: SkParagraphStyle
  ) {
    const style = new this.CanvasKit.ParagraphStyle(
      JsiSkParagraphStyle.toParagraphStyle(this.CanvasKit, paragraphStyle ?? {})
    );
    return new JsiSkParagraphBuilder(
      this.CanvasKit,
      this.CanvasKit.ParagraphBuilder.MakeFromFontProvider(
        style,
        JsiSkTypeface.fromValue(typefaceProvider)
      )
    );
  }

  MakeFromSystem(_paragraphStyle?: SkParagraphStyle): SkParagraphBuilder {
    throw new NotImplementedOnRNWeb();
  }
}
