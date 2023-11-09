import type { SkCanvas } from "../Canvas";
import type { SkJSIInstance } from "../JsiInstance";
import type { SkRect } from "../Rect";
import { SkTextDirection } from "./ParagraphStyle";

export interface SkRectWithDirection {
  rect: SkRect;
  direction: SkTextDirection;
}

export interface SkParagraph extends SkJSIInstance<"Paragraph"> {
  /**
   * Calculates the position of the the glyphs in the paragraph
   * @param width Max width of the paragraph
   */
  layout(width: number): void;
  /**
   * Paints the paragraph to the provded canvas
   * @param canvas Canvas to paint into
   * @param x X coordinate to paint at
   * @param y Y coordinate to paint at
   */
  paint(canvas: SkCanvas, x: number, y: number): void;
  /**
   * Returns the height of the paragraph. This method requires the layout
   * method to have been called first.
   */
  getHeight(): number;
  /**
   * Returns the max width of the paragraph. This method requires the layout
   * method to have been called first.
   */
  getMaxWidth(): number;
  /**
   * Returns the index of the glyph at the given position. This method requires
   * the layout method to have been called first.
   * @param x X coordinate of the position
   * @param y Y coordinate of the position
   */
  getGlyphPositionAtCoordinate(x: number, y: number): number;
  /**
   * Returns the bounding boxes of the glyphs in the given range. This method
   * requires the layout method to have been called first.
   * @param start Start index of the range
   * @param end End index of the range
   */
  getRectsForRange(start: number, end: number): SkRect[];
  /**
   * Returns the bounding boxes for all lines in the paragraph. This method
   * requires the layout method to have been called first.
   */
  getLineMetrics(): Array<SkRect>;
  /**
   * Returns a list of rects with direction info for the placeholders added
   * to the paragraph.
   */
  getRectsForPlaceholders(): SkRectWithDirection[];
}
