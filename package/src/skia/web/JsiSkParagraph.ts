import type { CanvasKit, Paragraph } from "canvaskit-wasm";

import type { SkParagraphStyle, SkRect, SkTextStyle } from "../types";
import { type SkParagraph } from "../types";

import { HostObject } from "./Host";
import type { JsiSkCanvas } from "./JsiSkCanvas";

// Used for E2E testing
export type ParagraphNode =
  | PlaceholderNode
  | TextNode
  | PushStyleNode
  | PopStyleNode;

export type TextNode = {
  type: "text";
  text: string;
};

export type PlaceholderNode = {
  type: "placeholder";
  width: number;
  height: number;
  alignment: number;
  baseline: number;
  offset: number;
};

export type PushStyleNode = {
  type: "push_style";
  style: SkTextStyle;
};

export type PopStyleNode = {
  type: "pop_style";
};

export class JsiSkParagraph
  extends HostObject<Paragraph, "Paragraph">
  implements SkParagraph
{
  constructor(
    CanvasKit: CanvasKit,
    ref: Paragraph,
    private elements?: ParagraphNode[],
    private style?: SkParagraphStyle
  ) {
    super(CanvasKit, ref, "Paragraph");
  }

  getElements(): ParagraphNode[] | undefined {
    return this.elements;
  }

  getStyle(): SkParagraphStyle | undefined {
    return this.style;
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
