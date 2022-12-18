import type { DrawingInfo } from "../views";
import type { Skia } from "../skia/types";
import type { DrawingContext as DOMDrawingContext } from "../dom/types";

export interface DrawingContext
  extends Omit<DrawingInfo, "touches">,
    DOMDrawingContext {
  Skia: Skia;
}
