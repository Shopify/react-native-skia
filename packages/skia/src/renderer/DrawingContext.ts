import type { Skia, SkCanvas, SkPaint } from "../skia/types";

export interface DrawingContext {
  Skia: Skia;
  canvas: SkCanvas;
  paint: SkPaint;
}
