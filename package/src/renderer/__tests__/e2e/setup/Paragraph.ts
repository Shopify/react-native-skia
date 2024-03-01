import type { SkParagraph, Skia, SkCanvas } from "../../../../skia/types";
import type { EvalContext } from "../../setup";

import { SkiaObject } from "./SkiaObject";

export class ParagraphAsset<Ctx extends EvalContext>
  extends SkiaObject<Ctx, SkParagraph>
  implements SkParagraph
{
  constructor(
    Skia: Skia,
    fn: (Skia: Skia, ctx: Ctx) => SkParagraph,
    context: Ctx = {} as Ctx
  ) {
    super(Skia, fn, context);
  }

  layout(width: number) {
    this.instance.layout(width);
  }
  paint(canvas: SkCanvas, x: number, y: number) {
    this.instance.paint(canvas, x, y);
  }
  getHeight() {
    return this.instance.getHeight();
  }
  getMaxWidth() {
    return this.instance.getMaxWidth();
  }
  getMinIntrinsicWidth() {
    return this.instance.getMinIntrinsicWidth();
  }
  getMaxIntrinsicWidth() {
    return this.instance.getMaxIntrinsicWidth();
  }
  getLongestLine() {
    return this.instance.getLongestLine();
  }
  getGlyphPositionAtCoordinate(x: number, y: number) {
    return this.instance.getGlyphPositionAtCoordinate(x, y);
  }
  getRectsForRange(start: number, end: number) {
    return this.instance.getRectsForRange(start, end);
  }
  getLineMetrics() {
    return this.instance.getLineMetrics();
  }
  getRectsForPlaceholders() {
    return this.instance.getRectsForPlaceholders();
  }
  __typename__ = "Paragraph" as const;

  dispose(): void {
    this.instance.dispose();
  }
}
