import type { SkParagraph, Skia, SkCanvas } from "../../../../skia/types";
import type { EvalContext } from "../../setup";

export class ParagraphAsset<Ctx extends EvalContext> implements SkParagraph {
  private code: string;
  private paragraph: SkParagraph;
  constructor(
    Skia: Skia,
    fn: (Skia: Skia, ctx: Ctx) => SkParagraph,
    public context: Ctx = {} as Ctx
  ) {
    this.code = `(Skia, ctx) => {
    return (${fn.toString()})(Skia, ctx);
  }`;
    this.paragraph = fn(Skia, context);
  }

  layout(width: number) {
    this.paragraph.layout(width);
  }
  paint(canvas: SkCanvas, x: number, y: number) {
    this.paragraph.paint(canvas, x, y);
  }
  getHeight() {
    return this.paragraph.getHeight();
  }
  getMaxWidth() {
    return this.paragraph.getMaxWidth();
  }
  getMinIntrinsicWidth() {
    return this.paragraph.getMinIntrinsicWidth();
  }
  getMaxIntrinsicWidth() {
    return this.paragraph.getMaxIntrinsicWidth();
  }
  getLongestLine() {
    return this.paragraph.getLongestLine();
  }
  getGlyphPositionAtCoordinate(x: number, y: number) {
    return this.paragraph.getGlyphPositionAtCoordinate(x, y);
  }
  getRectsForRange(start: number, end: number) {
    return this.paragraph.getRectsForRange(start, end);
  }
  getLineMetrics() {
    return this.paragraph.getLineMetrics();
  }
  getRectsForPlaceholders() {
    return this.paragraph.getRectsForPlaceholders();
  }
  __typename__: "Paragraph" = "Paragraph" as const;

  dispose(): void {
    this.paragraph.dispose();
  }

  source() {
    return this.code;
  }
}
