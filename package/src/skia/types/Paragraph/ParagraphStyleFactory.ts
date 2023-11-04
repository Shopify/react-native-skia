import type { SkParagraphStyle } from ".";

export interface ParagraphStyleFactory {
  /**
   * Creates a new ParagraphStyle object that can be used to create a Paragraph.
   */
  Make(): SkParagraphStyle;
}
