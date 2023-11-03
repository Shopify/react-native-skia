import { SkJSIInstance } from "../JsiInstance";
import { SkPath } from "../Path";
import { SkRect } from "../Rect";

export interface SkParagraph extends SkJSIInstance<"Paragraph"> {
  /**
   * Calculates the position of the the glyphs in the paragraph
   * @param width Max width of the paragraph
   */
  layout(width: number): void;
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
   * Returns the number of lines in the paragraph. This method requires the
   * layout method to have been called first.
   */
  getLineCount(): number;
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
   * Returns the glyphs in a given line to a path. This method requires the
   * layout method to have been called first.
   * @param line Line to get paths from
   */
  getPath(line: number): SkPath;
  /**
   * Returns the line number for the given glyph index. This method requires
   * the layout method to have been called first.
   * @param index Index of glyph to find line number for
   */
  getLineNumberAt(index: number): number;
  /**
   * Returns the bounding boxes for all lines in the paragraph. This method
   * requires the layout method to have been called first.
   */
  getLineMetrics(): Array<SkRect>;
}
