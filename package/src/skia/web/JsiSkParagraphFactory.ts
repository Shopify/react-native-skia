import type {
  CanvasKit,
  FontBlock,
  FontCollection,
  FontMgr,
  ParagraphBuilder,
  ParagraphBuilderFactory,
  ParagraphStyle,
  ShapedLine,
  TypefaceFontProvider,
} from "canvaskit-wasm";

import { Host } from "./Host";

export class JsiSkParagraphFactory
  extends Host
  implements ParagraphBuilderFactory
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }
  Make(_style: ParagraphStyle, _fontManager: FontMgr): ParagraphBuilder {
    throw new Error("Method not implemented.");
  }
  MakeFromFontProvider(
    _style: ParagraphStyle,
    _fontSrc: TypefaceFontProvider
  ): ParagraphBuilder {
    throw new Error("Method not implemented.");
  }
  MakeFromFontCollection(
    _style: ParagraphStyle,
    _fontCollection: FontCollection
  ): ParagraphBuilder {
    throw new Error("Method not implemented.");
  }
  ShapeText(
    _text: string,
    _runs: FontBlock[],
    _width?: number | undefined
  ): ShapedLine[] {
    throw new Error("Method not implemented.");
  }
  RequiresClientICU() {
    return this.CanvasKit.ParagraphBuilder.RequiresClientICU();
  }
}
