import { SkJSIInstance } from "../JsiInstance";
import { SkColor } from "../Color";
import { SkPaint } from "../Paint";
import { FontSlant, FontWeight, FontWidth, FontStyle } from "../Font";

export interface SkTextStyle extends SkJSIInstance<"TextStyle"> {
  /**
   * Sets the color of the Paragraph TextStyle.
   * @param color Skia color
   */
  setColor: (color: SkColor) => SkTextStyle;
  /**
   * Sets the font size of the Paragraph TextStyle.
   * @param fontSize size of font
   */
  setFontSize: (fontSize: number) => SkTextStyle;
  /**
   * Sets the font families of the Paragraph TextStyle.
   * @param fontSize size of font
   */
  setFontFamilies: (fontFamilies: string[]) => SkTextStyle;
  /**
   * Sets the paint element used to paint the foreground of text.
   * @param paint Paint to use for foreground text
   */
  setForegroundPaint: (paint: SkPaint) => SkTextStyle;
  /**
   * Sets the paint element used to paint the background of text.
   * @param paint Paint to use for foreground text
   */
  setBackgroundPaint: (paint: SkPaint) => SkTextStyle;
  /**
   * Sets the font style for the text from predefined values.
   * @param fontStyle Fontstyle to set
   */
  setFontStyle: (fontStyle: FontStyle) => SkTextStyle;
  /**
   * Set font weight for the style
   * @param fontWeight Weight
   */
  setFontWeight: (fontWeight: FontWeight) => SkTextStyle;
  /**
   * Set font width for the style
   * @param fontWidth Width
   */
  setFontWidth: (fontWidth: FontWidth) => SkTextStyle;
  /**
   * Set font slant for the style
   * @param fontSlant Slant
   */
  setFontSlant: (fontSlant: FontSlant) => SkTextStyle;
  /**
   * Sets the letter spacing for the text.
   * @param letterSpacing Letter spacing
   */
  setLetterSpacing: (letterSpacing: number) => SkTextStyle;
  /**
   * Sets the word spacing for the text
   * @param wordSpacing Word spacing
   */
  setWordSpacing: (wordSpacing: number) => SkTextStyle;
  /**
   * Sets the height of the style
   * @param height Height
   */
  setHeight: (height: number) => SkTextStyle;
  /**
   * Sets the height override of the style
   * @param heightOverride Height override
   */
  setHeightOverride: (heightOverride: boolean) => SkTextStyle;
  /**
   * Sets the baseline shift for the text
   * @param baselineShift Baseline shift
   */
  setBaselineShift: (baselineShift: number) => SkTextStyle;
}
