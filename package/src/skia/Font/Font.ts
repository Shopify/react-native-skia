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

const fontStyle = (
  weight: FontWeight,
  width: FontWidth,
  slant: FontSlant
): FontStyle => ({ weight, width, slant });

export interface FontStyle {
  weight?: FontWeight;
  width?: FontWidth;
  slant?: FontSlant;
}

export enum FontWeight {
  Invisible = 0,
  Thin = 100,
  ExtraLight = 200,
  Light = 300,
  Normal = 400,
  Medium = 500,
  SemiBold = 600,
  Bold = 700,
  ExtraBold = 800,
  Black = 900,
  ExtraBlack = 1000,
}

export enum FontWidth {
  UltraCondensed = 1,
  ExtraCondensed = 2,
  Condensed = 3,
  SemiCondensed = 4,
  Normal = 5,
  SemiExpanded = 6,
  Expanded = 7,
  ExtraExpanded = 8,
  UltraExpanded = 9,
}

export enum FontSlant {
  Upright,
  Italic,
  Oblique,
}

export const FontStyle = {
  Normal: fontStyle(FontWeight.Normal, FontWidth.Normal, FontSlant.Upright),
  Bold: fontStyle(FontWeight.Bold, FontWidth.Normal, FontSlant.Upright),
  Italic: fontStyle(FontWeight.Normal, FontWidth.Normal, FontSlant.Italic),
  BoldItalic: fontStyle(FontWeight.Bold, FontWidth.Normal, FontSlant.Italic),
};
