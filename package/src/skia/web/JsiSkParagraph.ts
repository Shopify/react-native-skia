import type { CanvasKit, Paragraph } from "canvaskit-wasm";

import type { SkRect, SkRectWithDirection, SkParagraph } from "../types";

import { HostObject } from "./Host";
import type { JsiSkCanvas } from "./JsiSkCanvas";

export class JsiSkParagraph
  extends HostObject<Paragraph, "Paragraph">
  implements SkParagraph
{
  constructor(CanvasKit: CanvasKit, ref: Paragraph) {
    super(CanvasKit, ref, "Paragraph");
  }
  getMinIntrinsicWidth(): number {
    return this.ref.getMinIntrinsicWidth();
  }

  getMaxIntrinsicWidth(): number {
    return this.ref.getMaxIntrinsicWidth();
  }

  getLongestLine(): number {
    return this.ref.getLongestLine();
  }

  layout(width: number): void {
    this.ref.layout(width);
  }
  paint(canvas: JsiSkCanvas, x: number, y: number): void {
    canvas.ref.drawParagraph(this.ref, x, y);
  }
  getHeight(): number {
    return this.ref.getHeight();
  }
  getMaxWidth(): number {
    return this.ref.getMaxWidth();
  }
  getGlyphPositionAtCoordinate(x: number, y: number): number {
    return this.ref.getGlyphPositionAtCoordinate(x, y).pos;
  }
  getRectsForPlaceholders(): SkRectWithDirection[] {
    return this.ref.getRectsForPlaceholders().map(({ rect, dir }) => ({
      rect: {
        x: rect.at(0)!,
        y: rect.at(1)!,
        width: rect.at(2)!,
        height: rect.at(3)!,
      },
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
      .map(({ rect }) => ({
        x: rect[0],
        y: rect[1],
        width: rect[2],
        height: rect[3],
      }));
  }
  getLineMetrics(): SkRect[] {
    return this.ref.getLineMetrics().map((r, index) => ({
      x: r.left,
      y: index * r.height,
      width: r.width,
      height: r.height,
    }));
  }

  dispose() {
    this.ref.delete();
  }
}
