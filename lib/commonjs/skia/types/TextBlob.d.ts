import type { SkJSIInstance } from "./JsiInstance";
import type { SkFont } from "./Font/Font";
import type { SkRSXform } from "./RSXform";
export type SkTextBlob = SkJSIInstance<"TextBlob">;
export interface TextBlobFactory {
    /**
     * Return a TextBlob with a single run of text.
     *
     * It uses the default character-to-glyph mapping from the typeface in the font.
     * It does not perform typeface fallback for characters not found in the Typeface.
     * It does not perform kerning or other complex shaping; glyphs are positioned based on their
     * default advances.
     * @param str
     * @param font
     */
    MakeFromText(str: string, font: SkFont): SkTextBlob;
    /**
     * Return a TextBlob with a single run of text.
     *
     * It does not perform typeface fallback for characters not found in the Typeface.
     * It does not perform kerning or other complex shaping; glyphs are positioned based on their
     * default advances.
     * @param glyphs - if using Malloc'd array, be sure to use CanvasKit.MallocGlyphIDs().
     * @param font
     */
    MakeFromGlyphs(glyphs: number[], font: SkFont): SkTextBlob;
    /**
     * Returns a TextBlob built from a single run of text with rotation, scale, and translations.
     *
     * It uses the default character-to-glyph mapping from the typeface in the font.
     * @param str
     * @param rsxforms
     * @param font
     */
    MakeFromRSXform(str: string, rsxforms: SkRSXform[], font: SkFont): SkTextBlob;
    /**
     * Returns a TextBlob built from a single run of text with rotation, scale, and translations.
     *
     * @param glyphs - if using Malloc'd array, be sure to use CanvasKit.MallocGlyphIDs().
     * @param rsxforms
     * @param font
     */
    MakeFromRSXformGlyphs(glyphs: number[], rsxforms: SkRSXform[], font: SkFont): SkTextBlob;
}
