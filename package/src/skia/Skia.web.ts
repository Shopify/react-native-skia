import type { CanvasKit } from "canvaskit-wasm";

import { JsiSkApi } from "./web";

export let Skia = JsiSkApi(global.CanvasKit);

export const setSkiaCanvasKit = (CanvasKit: CanvasKit) => {
  Skia = JsiSkApi(CanvasKit);
};
