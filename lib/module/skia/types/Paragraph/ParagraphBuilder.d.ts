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
    Make(paragraphStyle?: SkParagraphStyle, typefaceProvider?: SkTypefaceFontProvider): SkParagraphBuilder;
}
export declare enum PlaceholderAlignment {
    Baseline = 0,
    AboveBaseline = 1,
    BelowBaseline = 2,
    Top = 3,
    Bottom = 4,
    Middle = 5
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
    pushStyle: (style: SkTextStyle, foregroundPaint?: SkPaint | undefined, backgroundPaint?: SkPaint | undefined) => SkParagraphBuilder;
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
    addPlaceholder(width?: number, height?: number, alignment?: PlaceholderAlignment, baseline?: TextBaseline, offset?: number): SkParagraphBuilder;
}
