import type { ISkiaViewApi } from "./types";

declare global {
  var SkiaViewApi: ISkiaViewApi;
}

export const { SkiaViewApi } = global;
