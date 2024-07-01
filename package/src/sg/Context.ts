/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  SkCanvas,
  SkColorFilter,
  SkImageFilter,
  SkMaskFilter,
  SkPaint,
  SkPathEffect,
  SkShader,
  Skia,
} from "../skia/types";

export interface DrawingContext {
  Skia: Skia;
  canvas: SkCanvas;
  paint: SkPaint;
}

export interface PaintingContext {
  paints: SkPaint[];
  maskFilters: SkMaskFilter[];
  shaders: SkShader[];
  pathEffects: SkPathEffect[];
  imageFilters: SkImageFilter[];
  colorFilters: SkColorFilter[];
}

export const processContext = (
  ctx: DrawingContext,
  props: Record<string, any>
) => {
  "worklet";
  return { restore: false, restorePaint: false };
};
