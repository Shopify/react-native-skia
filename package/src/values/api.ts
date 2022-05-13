import type { ISkiaValueApi } from "./types";

declare global {
  var SkiaValueApi: ISkiaValueApi;
}

const { SkiaValueApi } = global;
export const ValueApi = SkiaValueApi;

export const { createValue, createDerivedValue } = ValueApi;
