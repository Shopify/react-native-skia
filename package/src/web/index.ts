import CanvasKitInit from "canvaskit-wasm";

import { JsiSkApi } from "../skia/web";

export const LoadSkia = async () => {
  const CanvasKit = await CanvasKitInit();
  // TODO: we add CanvasKit here to be compatible with legacy code but this should be removed
  global.CanvasKit = CanvasKit;
  global.Skia = JsiSkApi(CanvasKit);
};
