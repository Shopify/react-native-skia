import type { SkCanvas, SkPaint, Skia } from "../skia/types";

export interface PaintingContext {
  paints: SkPaint[];
  // maskFilters: SkMaskFilter[];
  // shaders: SkShader[];
  // pathEffects: SkPathEffect[];
  // imageFilters: SkImageFilter[];
  // colorFilters: SkColorFilter[];
}

export interface DrawingContext extends PaintingContext {
  Skia: Skia;
  canvas: SkCanvas;
}

export const getPaint = (ctx: DrawingContext) => {
  "worklet";
  return ctx.paints[ctx.paints.length - 1];
};

// export const processContext = (
//   ctx: DrawingContext,
//   props: Record<string, any>
// ) => {
//   "worklet";
//   return { restore: false, restorePaint: false };
// };
