import type { SkJSIInstance } from "../JsiInstance";
import type { SkColor } from "../Color";
import type { FontSlant, FontWeight, FontWidth } from "../Font";
import type { SkPoint } from "../Point";

export enum TextDecoration {
  NoDecoration = 0x0,
  Underline = 0x1,
  Overline = 0x2,
  LineThrough = 0x4,
}

export enum TextDecorationStyle {
  Solid = 0,
  Double,
  Dotted,
  Dashed,
  Wavy,
}

export interface SkTextShadow {
  color?: SkColor;
  /**
   * 2d array for x and y offset. Defaults to [0, 0]
   */
  offset?: SkPoint;
  blurRadius?: number;
}

export interface SkTextStyle extends SkJSIInstance<"TextStyle"> {
  /**
   * Sets the decoration of the Paragraph TextStyle.
   */
  setDecorationType: (decoration: TextDecoration) => SkTextStyle;
  /**
   * Sets the color of the decorator
   */
  setDecorationColor: (color: SkColor) => SkTextStyle;
  /**
   * Sets the thickness of the decorator
   */
  setDecorationThickness: (thickness: number) => SkTextStyle;
  /**
   * Sets the style of the decorator
   */
  setDecorationStyle: (style: TextDecorationStyle) => SkTextStyle;
  /**
   * Sets the color of the Paragraph TextStyle.
   */
  setColor: (color: SkColor) => SkTextStyle;
  /**
   * Sets the font size of the Paragraph TextStyle.
   */
  setFontSize: (fontSize: number) => SkTextStyle;
  /**
   * Sets the font families of the Paragraph TextStyle.
   */
  setFontFamilies: (fontFamilies: string[]) => SkTextStyle;
  /**
   * Sets the color used to paint the background of text.
   */
  setBackgroundColor: (color: SkColor) => SkTextStyle;
  /**
   * Set font weight for the style
   */
  setFontWeight: (fontWeight: FontWeight) => SkTextStyle;
  /**
   * Set font width for the style
   */
  setFontWidth: (fontWidth: FontWidth) => SkTextStyle;
  /**
   * Set font slant for the style
   */
  setFontSlant: (fontSlant: FontSlant) => SkTextStyle;
  /**
   * Sets the letter spacing for the text.
   */
  setLetterSpacing: (letterSpacing: number) => SkTextStyle;
  /**
   * Sets the word spacing for the text
   */
  setWordSpacing: (wordSpacing: number) => SkTextStyle;
  /**
   * Sets the list of shadows for the text
   */
  setShadows: (shadows: SkTextShadow[]) => SkTextStyle;
  /**
   * Returns the shadows for the text
   */
  getShadows: () => SkTextShadow[] | undefined;
  /**
   * Sets the color of the Paragraph TextStyle.
   */
  getColor: () => SkColor | undefined;
  /**
   * Gets the font size of the Paragraph TextStyle.
   */
  getFontSize: () => number | undefined;
  /**
   * Gets the font families of the Paragraph TextStyle.
   */
  getFontFamilies: () => string[] | undefined;
  /**
   * Gets the paint element used to paint the background of text.
   */
  getBackgroundColor: () => SkColor | undefined;
  /**
   * Get font weight for the style
   */
  getFontWeight: () => FontWeight | undefined;
  /**
   * Get font width for the style
   */
  getFontWidth: () => FontWidth | undefined;
  /**
   * Get font slant for the style
   */
  getFontSlant: () => FontSlant | undefined;
  /**
   * Gets the letter spacing for the text.
   */
  getLetterSpacing: () => number | undefined;
  /**
   * Gets the word spacing for the text
   */
  getWordSpacing: () => number | undefined;
  /**
   * Gets the decoration of the Paragraph TextStyle.
   */
  getDecorationType: () => TextDecoration | undefined;
  /**
   * Gets the color of the decorator
   */
  getDecorationColor: () => SkColor | undefined;
  /**
   * Gets the thickness of the decorator
   */
  getDecorationThickness: () => number | undefined;
  /**
   * Gets the style of the decorator
   */
  getDecorationStyle: () => TextDecorationStyle | undefined;
}
