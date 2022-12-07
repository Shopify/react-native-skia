import type { RefObject } from "react";

import type { DrawingInfo, SkiaView } from "../views";
import type { Skia, Vector } from "../skia/types";
import type { DrawingContext as DOMDrawingContext } from "../dom/types";

export interface DrawingContext
  extends Omit<DrawingInfo, "touches">,
    DOMDrawingContext {
  center: Vector;
  ref: RefObject<SkiaView>;
  Skia: Skia;
}
