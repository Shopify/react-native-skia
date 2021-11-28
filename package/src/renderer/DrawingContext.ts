import type { TouchInfo, DrawingInfo } from "../views";
import type { ICanvas, IPaint } from "../skia";

import type { Vector } from "./math/Vector";

export interface DrawingContext extends Omit<DrawingInfo, "touches"> {
  canvas: ICanvas;
  paint: IPaint;
  opacity: number;
  center: Vector;
  getTouches(): Array<Array<TouchInfo>>;
}
