import type { RefObject } from "react";

import type { TouchInfo, DrawingInfo, SkiaView } from "../views";
import type { ICanvas, IPaint } from "../skia";
import type { FontMgr } from "../skia/FontMgr/FontMgr";

import type { Vector } from "./processors/math/Vector";

export interface DrawingContext extends Omit<DrawingInfo, "touches"> {
  canvas: ICanvas;
  paint: IPaint;
  opacity: number;
  center: Vector;
  ref: RefObject<SkiaView>;
  getTouches(): Array<Array<TouchInfo>>;
  fontMgr: FontMgr;
}
