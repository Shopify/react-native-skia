import type { RefObject } from "react";

import type { DrawingInfo, SkiaViewApi } from "../views/types";
import type { FontMgr, SkCanvas, SkPaint } from "../skia";
import type { Skia } from "../skia/types";

import type { Vector } from "./processors/math/Vector";

export interface DrawingContext extends Omit<DrawingInfo, "touches"> {
  canvas: SkCanvas;
  paint: SkPaint;
  opacity: number;
  center: Vector;
  ref: RefObject<SkiaViewApi>;
  fontMgr: FontMgr;
  Skia: Skia;
}
