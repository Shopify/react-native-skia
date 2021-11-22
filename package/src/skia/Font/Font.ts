import type { IPaint } from "../Paint";
import type { IRect } from "../Rect";

export interface Font {
  /** Get/Sets text size in points.
    Has no effect if textSize is not greater than or equal to zero.
  */
  size: number;
  /** Returns the advance width of text.
      The advance is the normal distance to move before drawing additional text.
      Returns the bounding box of text if bounds is not nullptr. The paint
      stroke settings, mask filter, or path effect may modify the bounds.

      @param text        character storage encoded with SkTextEncoding
      @param byteLength  length of character storage in bytes
      @param bounds      returns bounding box relative to (0, 0) if not nullptr
      @param paint       optional; may be nullptr
      @return            number of glyphs represented by text of length byteLength
  */
  measureText: (text: string, paint?: IPaint) => IRect;
}
