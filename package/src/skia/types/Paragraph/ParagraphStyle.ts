import { SkJSIInstance } from "../JsiInstance";
import { SkTextStyle } from "./TextStyle";

export enum TextDirection {
  LTR = 0,
  RTL = 1,
}
export enum TextAlign {
  Left = 0,
  Right,
  Center,
  Justify,
  Start,
  End,
}

export interface SkParagraphStyle extends SkJSIInstance<"ParagraphStyle"> {
  /**
   * Sets the default text style for the paragraph style
   * @param textStyle Default text style
   */
  setTextStyle(textStyle: SkTextStyle): SkParagraphStyle;
  /**
   * Sets the text direction for the paragraph style
   * @param textDirection Text direction
   */
  setTextDirection(textDirection: TextDirection): SkParagraphStyle;
  /**
   * Sets the alignment for the paragraph
   * @param textAlign Text alignment
   */
  setTextAlign(textAlign: TextAlign): SkParagraphStyle;
  /**
   * Sets the ellipsis to be used when text is truncated
   * @param ellipsis Ellipsis string
   */
  setEllipsis(ellipsis: string): SkParagraphStyle;
  /**
   * Sets the maximum number of lines to be used when text is truncated
   * @param maxLines Maximum number of lines
   */
  setMaxLines(maxLines: number): SkParagraphStyle;
}
