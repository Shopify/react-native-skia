import type { SkJSIInstance } from "../JsiInstance";

export interface SkParagraph extends SkJSIInstance<"Paragraph"> {
  /**
   * Lays out the text in the paragraph so it is wrapped to the given width.
   * @param width
   */
  layout(width: number): void;

  getHeight(): number;
}
