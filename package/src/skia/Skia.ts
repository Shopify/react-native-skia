/*global SkiaApi*/
import type { SkiaApi as SkSkiaApi } from "./types";

/**
 * Declares the SkiaApi as an available object in the global scope
 */
declare global {
  var SkiaApi: SkSkiaApi;
}

export const Skia = SkiaApi;
