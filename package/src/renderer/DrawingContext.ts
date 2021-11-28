import type { DrawingInfo } from "../views";
import type { ICanvas, IPaint } from "../skia";

import type { Vector } from "./math/Vector";

export interface DrawingContext extends DrawingInfo {
  canvas: ICanvas;
  paint: IPaint;
  opacity: number;
  center: Vector;
}
