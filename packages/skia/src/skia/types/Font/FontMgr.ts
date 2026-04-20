import type { SkJSIInstance } from "../JsiInstance";
import type { SkTypeface } from "../Typeface";

import type { FontStyle } from "./Font";

/**
 * Style metadata for a single font variant: its weight, width, slant, and
 * postscript name. Returned by {@link SkFontStyleSet.getStyle}.
 */
export interface FontStyleEntry extends Required<FontStyle> {
  name: string;
}

/**
 * An enumerable set of font variants for a single font family.
 * Obtained via {@link SkFontMgr.matchFamily} or {@link SkFontMgr.createStyleSet}.
 */
export interface SkFontStyleSet extends SkJSIInstance<"FontStyleSet"> {
  /** Number of variants in this set. */
  count(): number;
  /** Style metadata for the variant at the given index (must be in [0, count)). */
  getStyle(index: number): FontStyleEntry;
  /** Loads the exact typeface for a variant by index, or null if unavailable. */
  createTypeface(index: number): SkTypeface | null;
  /** Returns the typeface whose style most closely matches the given style. */
  matchStyle(style: FontStyle): SkTypeface | null;
}

export interface SkFontMgr extends SkJSIInstance<"FontMgr"> {
  countFamilies(): number;
  getFamilyName(index: number): string;
  /** Returns the style set for the family at the given index, or null. */
  createStyleSet(index: number): SkFontStyleSet | null;
  /** Returns the style set for the named font family, or null if not found. */
  matchFamily(name: string): SkFontStyleSet | null;
  matchFamilyStyle(name: string, style: FontStyle): SkTypeface;
}
