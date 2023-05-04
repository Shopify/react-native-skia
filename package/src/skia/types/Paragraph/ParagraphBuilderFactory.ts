import type { SkTypefaceFontProvider } from "../TypefaceFontProvider";

import type { SkParagraphBuilder } from "./ParagraphBuilder";
import type { ParagraphStyle } from "./ParagraphStyle";

export interface ParagraphBuilderFactory {
  /**
   * Creates a ParagraphBuilder using the fonts available from the given font provider.
   * @param style
   * @param fontSrc
   */
  MakeFromFontProvider(
    style: ParagraphStyle,
    fontSrc: SkTypefaceFontProvider
  ): SkParagraphBuilder;
}
