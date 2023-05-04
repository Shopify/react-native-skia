import type { SkJSIInstance } from "../JsiInstance";
import type { SkPaint } from "../Paint";

import type {
  PlaceholderAlignment,
  TextBaseline,
  TextStyle,
} from "./ParagraphStyle";
import type { SkParagraph } from "./Paragraph";

export interface SkParagraphBuilder extends SkJSIInstance<"ParagraphBuilder"> {
  /**
   * Pushes the information required to leave an open space.
   * @param width
   * @param height
   * @param alignment
   * @param baseline
   * @param offset
   */
  addPlaceholder(
    width?: number,
    height?: number,
    alignment?: PlaceholderAlignment,
    baseline?: TextBaseline,
    offset?: number
  ): void;

  /**
   * Adds text to the builder. Forms the proper runs to use the upper-most style
   * on the style_stack.
   * @param str
   */
  addText(str: string): void;

  /**
   * Returns a Paragraph object that can be used to be layout and paint the text to an
   * Canvas.
   */
  build(): SkParagraph;

  /**
   * Remove a style from the stack. Useful to apply different styles to chunks
   * of text such as bolding.
   */
  pop(): void;

  /**
   * Push a style to the stack. The corresponding text added with addText will
   * use the top-most style.
   * @param text
   */
  pushStyle(text: TextStyle): void;

  /**
   * Pushes a TextStyle using paints instead of colors for foreground and background.
   * @param textStyle
   * @param fg
   * @param bg
   */
  pushPaintStyle(textStyle: TextStyle, fg: SkPaint, bg: SkPaint): void;

  /**
   * Resets this builder to its initial state, discarding any text, styles, placeholders that have
   * been added, but keeping the initial ParagraphStyle.
   */
  reset(): void;
}
