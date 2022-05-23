import type { SkJSIInstance } from "../JsiInstance";
import type { FontStyle } from "../Font/Font";
import type { SkTypeface } from "../Typeface";

export interface FontMgr extends SkJSIInstance<"FontMgr"> {
  /**
   * Return the number of font families loaded in this manager. Useful for debugging.
   */
  countFamilies(): number;

  /**
   * Return the nth family name. Useful for debugging.
   * @param index
   */
  getFamilyName(index: number): string;

  /**
   *  Find the closest matching typeface to the specified familyName and style and return a ref to it.
   */
  matchFamilyStyle(
    familyName: string,
    fontStyle?: FontStyle
  ): SkTypeface | null;
}
