import { SkColor } from "../Color";
import { SkJSIInstance } from "../JsiInstance";

export interface SkParagraph extends SkJSIInstance<"Paragraph"> {}

export interface SkParagraphStyle extends SkJSIInstance<"ParagraphStyle"> {}

export interface SkTextStyle extends SkJSIInstance<"TextStyle"> {
  setColor: (color: SkColor) => void;
  setFontSize: (fontSize: number) => void;
  setFontFamilies: (fontFamilies: string[]) => void;
}
