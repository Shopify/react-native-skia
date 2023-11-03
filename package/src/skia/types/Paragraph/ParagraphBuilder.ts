import { SkFontMgr } from "../Font";
import { SkParagraph, SkParagraphStyle, SkTextStyle } from "../Paragraph";

export interface ParagraphBuilderFactory {
  Make(
    paragraphStyle: SkParagraphStyle,
    fontManager: SkFontMgr
  ): ParagraphBuilder;
}

export interface ParagraphBuilder {
  /**
   * Creates a Paragraph object from the builder and the inputs given to the builder.
   */
  build(): SkParagraph;
  pushStyle: (style: SkTextStyle) => void;
  pop: () => void;
  addText: (text: string) => void;
}
