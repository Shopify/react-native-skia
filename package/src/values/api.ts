import type { ISkiaValueApi } from "./types";

declare global {
  var SkiaValueApi: ISkiaValueApi;
}

const { SkiaValueApi } = global;
export const ValueApi = SkiaValueApi;
