import type { SkJSIInstance } from "../JsiInstance";
export interface SkTypeface extends SkJSIInstance<"Typeface"> {
    /**
     * Retrieves the glyph ids for each code point in the provided string. This call is passed to
     * the typeface of this font. Note that glyph IDs are typeface-dependent; different faces
     * may have different ids for the same code point.
     * @param str
     * @param numCodePoints - the number of code points in the string. Defaults to str.length.
     */
    getGlyphIDs(str: string, numCodePoints?: number): number[];
}
