import type { ISkiaViewApi } from "./types";

declare global {
  var SkiaViewApi: ISkiaViewApi;
  // Hermes exposes gc() for manual garbage collection
  var gc: (() => void) | undefined;
}

export const { SkiaViewApi } = global;
