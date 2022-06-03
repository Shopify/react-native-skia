import type { CanvasKit as CanvasKitType } from "canvaskit-wasm";

import { JsiSkApi } from "./web";

declare global {
  var CanvasKit: CanvasKitType;
}

export const Skia = JsiSkApi(global.CanvasKit);
