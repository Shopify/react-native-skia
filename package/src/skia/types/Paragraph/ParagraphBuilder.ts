import { SkFontMgr } from "../Font";
import { SkParagraph, SkParagraphStyle, SkTextStyle } from "../Paragraph";

export interface ParagraphBuilderFactory {
  /**
   * Creates a new ParagraphBuilder object.
   * @param paragraphStyle Initial paragraph style
   * @param fontManager Font manager
   */
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
  /**
   * Restores the builder to its initial empty state.
   */
  reset(): void;
  /**
   * Pushes a text-style to the builder
   * @param style Style to push
   * @returns The builder
   */
  pushStyle: (style: SkTextStyle) => ParagraphBuilder;
  /**
   * Pops the current text style from the builder
   * @returns The builder
   */
  pop: () => ParagraphBuilder;
  /**
   * Adds text to the builder
   * @param text
   * @returns The builder
   */
  addText: (text: string) => ParagraphBuilder;
}
