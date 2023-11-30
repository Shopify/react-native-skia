import type { SkJSIInstance } from "../JsiInstance";
import type { SkPaint } from "../Paint";

import type { SkParagraph } from "./Paragraph";
import type { SkParagraphStyle } from "./ParagraphStyle";
import type { SkTextStyle, TextBaseline } from "./TextStyle";
import type { SkTypefaceFontProvider } from "./TypefaceFontProvider";

export interface ParagraphBuilderFactory {
  /**
   * Creates a new ParagraphBuilder object from custom fonts.
   * @param paragraphStyle Initial paragraph style
   * @param typefaceProvider Typeface provider
   */
  Make(
    paragraphStyle?: SkParagraphStyle,
    typefaceProvider?: SkTypefaceFontProvider
  ): SkParagraphBuilder;
}

export enum PlaceholderAlignment {
  /// Match the baseline of the placeholder with the baseline.
  Baseline = 0,

  /// Align the bottom edge of the placeholder with the baseline such that the
  /// placeholder sits on top of the baseline.
  AboveBaseline,

  /// Align the top edge of the placeholder with the baseline specified in
  /// such that the placeholder hangs below the baseline.
  BelowBaseline,

  /// Align the top edge of the placeholder with the top edge of the font.
  /// When the placeholder is very tall, the extra space will hang from
  /// the top and extend through the bottom of the line.
  Top,

  /// Align the bottom edge of the placeholder with the top edge of the font.
  /// When the placeholder is very tall, the extra space will rise from
  /// the bottom and extend through the top of the line.
  Bottom,

  /// Align the middle of the placeholder with the middle of the text. When the
  /// placeholder is very tall, the extra space will grow equally from
  /// the top and bottom of the line.
  Middle,
}

export interface SkParagraphBuilder extends SkJSIInstance<"ParagraphBuilder"> {
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
   * @param foregroundPaint Foreground paint object
   * @param backgroundPaint Background paint object
   * @returns The builder
   */
  pushStyle: (
    style: SkTextStyle,
    foregroundPaint?: SkPaint | undefined,
    backgroundPaint?: SkPaint | undefined
  ) => SkParagraphBuilder;
  /**
   * Pops the current text style from the builder
   * @returns The builder
   */
  pop: () => SkParagraphBuilder;
  /**
   * Adds text to the builder
   * @param text
   * @returns The builder
   */
  addText: (text: string) => SkParagraphBuilder;
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
  ): SkParagraphBuilder;
}
