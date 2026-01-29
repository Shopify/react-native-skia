import type { CanvasKit, Paragraph } from "canvaskit-wasm";

import type {
  SkRect,
  SkRectWithDirection,
  SkParagraph,
  LineMetrics,
  GlyphRun,
} from "../types";

import { HostObject } from "./Host";
import type { JsiSkCanvas } from "./JsiSkCanvas";
import { JsiSkRect } from "./JsiSkRect";

export class JsiSkParagraph
  extends HostObject<Paragraph, "Paragraph">
  implements SkParagraph
{
  constructor(CanvasKit: CanvasKit, ref: Paragraph) {
    super(CanvasKit, ref, "Paragraph");
  }
  getMinIntrinsicWidth() {
    return this.ref.getMinIntrinsicWidth();
  }

  getMaxIntrinsicWidth() {
    return this.ref.getMaxIntrinsicWidth();
  }

  getLongestLine() {
    return this.ref.getLongestLine();
  }

  layout(width: number) {
    this.ref.layout(width);
  }
  paint(canvas: JsiSkCanvas, x: number, y: number) {
    canvas.ref.drawParagraph(this.ref, x, y);
  }
  getHeight() {
    return this.ref.getHeight();
  }
  getMaxWidth() {
    return this.ref.getMaxWidth();
  }
  getGlyphPositionAtCoordinate(x: number, y: number) {
    return this.ref.getGlyphPositionAtCoordinate(x, y).pos;
  }
  getRectsForPlaceholders(): SkRectWithDirection[] {
    return this.ref.getRectsForPlaceholders().map(({ rect, dir }) => ({
      rect: new JsiSkRect(this.CanvasKit, rect),
      direction: dir.value,
    }));
  }
  getRectsForRange(start: number, end: number): SkRect[] {
    return this.ref
      .getRectsForRange(
        start,
        end,
        { value: 0 } /** kTight */,
        { value: 0 } /** kTight */
      )
      .map(({ rect }) => new JsiSkRect(this.CanvasKit, rect));
  }
  getLineMetrics(): LineMetrics[] {
    return this.ref.getLineMetrics();
  }
  getGlyphs(): GlyphRun[] {
    const shapedLines = this.ref.getShapedLines();
    const result: GlyphRun[] = [];

    shapedLines.forEach((line, lineNumber) => {
      line.runs.forEach((run) => {
        const glyphIds: number[] = Array.from(run.glyphs);
        const positions: { x: number; y: number }[] = [];

        // positions are stored as flat array of floats: [x0, y0, x1, y1, ...]
        // There's count+1 positions to describe location "after" last glyph
        for (let i = 0; i < run.glyphs.length; i++) {
          positions.push({
            x: run.positions[i * 2],
            y: run.positions[i * 2 + 1],
          });
        }

        result.push({
          lineNumber,
          origin: { x: run.positions[0] || 0, y: run.positions[1] || 0 },
          advanceX:
            run.positions[run.glyphs.length * 2] - (run.positions[0] || 0),
          glyphIds,
          positions,
        });
      });
    });

    return result;
  }
}
