/*global SkiaApi*/
import type { Skia as SkSkiaApi } from "./types";

/**
 * Declares the SkiaApi as an available object in the global scope
 */
declare global {
  var SkiaApi: SkSkiaApi;
}

export const Skia = SkiaApi;

export const Malloc = (
  TypedArrayCls: typeof Uint8Array | typeof Float32Array,
  length: number
): Uint8Array | Float32Array => new TypedArrayCls(length);

export const Free = (_: Uint8Array | Float32Array): void => {};
