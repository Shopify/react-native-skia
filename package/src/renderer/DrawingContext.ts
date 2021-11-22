import type { Canvas, Paint } from "../skia";

export interface DrawingContext {
  canvas: Canvas;
  paint: Paint;
  opacity: number;
}
