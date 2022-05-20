import { CanvasKit } from "canvaskit-wasm";

//import type { SkiaApi } from "./SkiaApi";
import type { SkRect } from "./Rect";

const { CanvasKit } = global;

declare global {
  var CanvasKit: CanvasKit;
}

export const Skia = {
  XYWHRect: (x: number, y: number, width: number, height: number): SkRect => {
    return { x, y, width, height };
  },
};
