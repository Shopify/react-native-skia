import type { Canvas, Paint } from "../skia";

export interface DrawingContext {
  width: number;
  height: number;
  canvas: Canvas;
  paint: Paint;
  opacity: number;
}
