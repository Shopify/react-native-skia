import type { SkJSIInstance } from "../JsiInstance";

export interface SkTypefaceFontProvider
  extends SkJSIInstance<"TypefaceFontProvider"> {
  /**
   * Registers a given typeface with the given family name (ignoring whatever name the
   * typface has for itself).
   * @param bytes - the raw bytes for a typeface.
   * @param family
   */
  registerFont(bytes: ArrayBuffer | Uint8Array, family: string): void;
}
