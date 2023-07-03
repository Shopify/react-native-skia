import type { DrawingInfo } from "../views";
import type { Skia, SkCanvas, SkPaint } from "../skia/types";

export interface DrawingContext extends Omit<DrawingInfo, "touches"> {
  Skia: Skia;
  canvas: SkCanvas;
  paint: SkPaint;
}
