import type { RefObject } from "react";

import type { DrawingInfo, SkiaView } from "../views";
import type { FontMgr, SkCanvas, SkPaint } from "../skia";

import type { Vector } from "./processors/math/Vector";

export interface DrawingContext extends Omit<DrawingInfo, "touches"> {
  canvas: SkCanvas;
  paint: SkPaint;
  opacity: number;
  center: Vector;
  ref: RefObject<SkiaView>;
  fontMgr: FontMgr;
}
