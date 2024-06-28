/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SkCanvas, SkPaint, Skia } from "../skia/types";

export interface DrawingContext {
  Skia: Skia;
  canvas: SkCanvas;
  paint: SkPaint;
}

export const processContext = (
  ctx: DrawingContext,
  props: Record<string, any>
) => {
  "worklet";
  return { restore: false, restorePaint: false };
};
