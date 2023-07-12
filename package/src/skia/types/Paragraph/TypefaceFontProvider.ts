import type { SkJSIInstance } from "../JsiInstance";
import type { SkTypeface } from "../Typeface";

export interface SkTypefaceFontProvider
  extends SkJSIInstance<"TypefaceFontProvider"> {
  /**
   * Registers a given typeface with the given family name.
   * @param typeface - Typeface.
   * @param family
   */
  registerFont(typeface: SkTypeface, familyName: string): void;
}
