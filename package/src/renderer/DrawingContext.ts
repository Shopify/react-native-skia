import type { DrawingInfo } from "../views";
import type { ICanvas, IPaint } from "../skia";

export interface DrawingContext extends DrawingInfo {
  canvas: ICanvas;
  paint: IPaint;
  opacity: number;
}
