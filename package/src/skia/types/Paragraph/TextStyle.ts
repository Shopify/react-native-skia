import { SkJSIInstance } from "../JsiInstance";
import { SkColor } from "../Color";
import { FontSlant, FontWeight, FontWidth } from "../Font";

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
   * @param color Color to use for foreground text
   */
  setForegroundColor: (color: SkColor) => SkTextStyle;
  /**
   * Sets the paint element used to paint the background of text.
   * @param color Color to use for background text
   */
  setBackgroundColor: (color: SkColor) => SkTextStyle;
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
   * Sets the color of the Paragraph TextStyle.
   * @param color Skia color
   */
  getColor: () => SkColor | undefined;
  /**
   * Gets the font size of the Paragraph TextStyle.
   */
  getFontSize: () => number| undefined;
  /**
   * Gets the font families of the Paragraph TextStyle.
   */
  getFontFamilies: () => string[] | undefined;
  /**
   * Gets the paint element used to paint the foreground of text.
   */
  getForegroundColor: () => SkColor| undefined;
  /**
   * Gets the paint element used to paint the background of text.
   */
  getBackgroundColor: () => SkColor| undefined;
  /**
   * Get font weight for the style
   */
  getFontWeight: () => FontWeight| undefined;
  /**
   * Get font width for the style
   */
  getFontWidth: () => FontWidth| undefined;
  /**
   * Get font slant for the style
   */
  getFontSlant: () => FontSlant| undefined;
  /**
   * Gets the letter spacing for the text.
   */
  getLetterSpacing: () => number| undefined;
  /**
   * Gets the word spacing for the text
   */
  getWordSpacing: () => number| undefined;

}
