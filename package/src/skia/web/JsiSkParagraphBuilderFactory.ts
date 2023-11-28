import type { CanvasKit, ParagraphBuilder } from "canvaskit-wasm";

import type {
  ParagraphBuilderFactory,
  SkFontMgr,
  SkParagraphStyle,
} from "../types";

import { Host } from "./Host";
import { JsiSkParagraphBuilder } from "./JsiSkParagraphBuilder";
import { JsiSkFontMgr } from "./JsiSkFontMgr";
import { JsiSkParagraphStyle } from "./JsiSkParagraphStyle";

export class JsiSkParagraphBuilderFactory
  extends Host
  implements ParagraphBuilderFactory
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  Make(paragraphStyle?: SkParagraphStyle, fontManager?: SkFontMgr) {
    const style = new this.CanvasKit.ParagraphStyle(
      JsiSkParagraphStyle.toParagraphStyle(this.CanvasKit, paragraphStyle ?? {})
    );

    let builder: ParagraphBuilder;
    if (fontManager) {
      builder = this.CanvasKit.ParagraphBuilder.Make(
        style,
        JsiSkFontMgr.fromValue(fontManager)
      );
    } else {
      builder = this.CanvasKit.ParagraphBuilder.MakeFromFontProvider(
        style,
        this.CanvasKit.TypefaceFontProvider.Make()
      );
    }

    return new JsiSkParagraphBuilder(this.CanvasKit, builder);
  }
}
