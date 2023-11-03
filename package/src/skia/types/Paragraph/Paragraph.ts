import { SkColor } from "../Color";
import { SkJSIInstance } from "../JsiInstance";

export interface SkParagraph extends SkJSIInstance<"Paragraph"> {}

export interface SkParagraphStyle extends SkJSIInstance<"ParagraphStyle"> {}

export interface SkTextStyle extends SkJSIInstance<"TextStyle"> {
  /**
   * Sets the color of the Paragraph TextStyle.
   * @param color Skia color
   */
  setColor: (color: SkColor) => void;
  /**
   * Sets the font size of the Paragraph TextStyle.
   * @param fontSize size of font
   */
  setFontSize: (fontSize: number) => void;
  /**
   * Sets the font families of the Paragraph TextStyle.
   * @param fontSize size of font
   */
  setFontFamilies: (fontFamilies: string[]) => void;
}
