import { CanvasKit } from "canvaskit-wasm";

//import type { SkiaApi } from "./SkiaApi";

const { CanvasKit } = global;

declare global {
  var CanvasKit: CanvasKit;
}

export const Skia = {};
