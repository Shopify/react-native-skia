import type { SkCanvas } from "../Canvas";
import type { SkJSIInstance } from "../JsiInstance";
import type { SkRect } from "../Rect";

import type { TextDirection } from "./ParagraphStyle";

export interface SkRectWithDirection {
  rect: SkRect;
  direction: TextDirection;
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
   * Returns the minimum intrinsic width of the paragraph.
   * The minimum intrinsic width is the width beyond which increasing the width of the paragraph
   * does not decrease the height. This is effectively the width at which the paragraph
   * can no longer wrap lines and is forced to overflow.
   * This method requires the layout method to have been called first.
   * @returns {number} The minimum intrinsic width of the paragraph.
   */
  getMinIntrinsicWidth(): number;
  /**
   * Returns the maximum intrinsic width of the paragraph.
   * The maximum intrinsic width is the width at which the paragraph can layout its content without line breaks,
   * meaning it's the width of the widest line or the widest word if the widest line is shorter than that.
   * This width represents the ideal width for the paragraph to display all content in a single line without overflow.
   * This method requires the layout method to have been called first.
   * @returns {number} The maximum intrinsic width of the paragraph.
   */
  getMaxIntrinsicWidth(): number;

  /**
   * Returns the width of the longest line in the paragraph.
   * This method requires the layout method to have been called first.
   */
  getLongestLine(): number;

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
