import type { CanvasKit, FontMgr, ParagraphStyle } from "canvaskit-wasm";

import type {
  ParagraphBuilderFactory,
  SkFontMgr,
  SkParagraphStyle,
} from "../types";

import { Host } from "./Host";
import { JsiSkParagraphBuilder } from "./JsiSkParagraphBuilder";
import { JsiSkParagraphStyle } from "./JsiSkParagraphStyle";
import { JsiSkFontMgr } from "./JsiSkFontMgr";

export class JsiSkParagraphBuilderFactory
  extends Host
  implements ParagraphBuilderFactory
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  Make(paragraphStyle?: SkParagraphStyle, fontManager?: SkFontMgr) {
    const style: ParagraphStyle = paragraphStyle
      ? JsiSkParagraphStyle.fromValue(paragraphStyle)
      : new this.CanvasKit.ParagraphStyle({
          disableHinting: undefined,
          ellipsis: undefined,
          heightMultiplier: undefined,
          maxLines: undefined,
          replaceTabCharacters: undefined,
          strutStyle: undefined,
          textAlign: undefined,
          textDirection: undefined,
          textHeightBehavior: undefined,
          textStyle: {},
        });
    const fontMgr: FontMgr = fontManager
      ? JsiSkFontMgr.fromValue(fontManager)
      : // TODO: Fix this one?
        this.CanvasKit.FontMgr.FromData(new ArrayBuffer(0))!;

    this.CanvasKit.FontMgr;
    return new JsiSkParagraphBuilder(
      this.CanvasKit,
      this.CanvasKit.ParagraphBuilder.Make(style, fontMgr)
    );
  }
}
