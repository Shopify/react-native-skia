import type { ICanvas, IPaint } from "../skia";

export interface DrawingContext {
  width: number;
  height: number;
  canvas: ICanvas;
  paint: IPaint;
  opacity: number;
}
