import type { SkCanvas, SkPaint, Skia } from "../skia/types";

export interface DrawingContext {
  Skia: Skia;
  canvas: SkCanvas;
  paint: SkPaint;
}
