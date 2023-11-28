import type { CanvasKit, FontMgr } from "canvaskit-wasm";

import type {
  ParagraphBuilderFactory,
  SkFontMgr,
  SkParagraphStyle,
  SkTypefaceFontProvider,
} from "../types";

import { Host } from "./Host";
import { JsiSkParagraphBuilder } from "./JsiSkParagraphBuilder";
import { JsiSkFontMgr } from "./JsiSkFontMgr";
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

  Make(paragraphStyle?: SkParagraphStyle, fontManager?: SkFontMgr) {
    const style = new this.CanvasKit.ParagraphStyle(
      JsiSkParagraphStyle.toParagraphStyle(this.CanvasKit, paragraphStyle ?? {})
    );
    if (fontManager) {
      const fontMgr = JsiSkFontMgr.fromValue<FontMgr>(fontManager);
      return new JsiSkParagraphBuilder(
        this.CanvasKit,
        this.CanvasKit.ParagraphBuilder.Make(style, fontMgr)
      );
    } else {
      throw new Error("fontManager is required on React Native Web");
    }
  }
}
