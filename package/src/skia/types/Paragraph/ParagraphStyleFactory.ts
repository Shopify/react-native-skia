import { SkParagraphStyle } from ".";

export interface ParagraphStyleFactory {
  Make(): SkParagraphStyle;
}
