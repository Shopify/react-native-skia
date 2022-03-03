import type { RefObject } from "react";

import type { TouchInfo, DrawingInfo, SkiaView } from "../views";
import type { SkCanvas, SkPaint } from "../skia";
import type { FontMgr } from "../skia/FontMgr/FontMgr";

import type { Vector } from "./processors/math/Vector";

export interface DrawingContext extends Omit<DrawingInfo, "touches"> {
  canvas: SkCanvas;
  paint: SkPaint;
  opacity: number;
  center: Vector;
  ref: RefObject<SkiaView>;
  getTouches(): Array<Array<TouchInfo>>;
  fontMgr: FontMgr;
}
