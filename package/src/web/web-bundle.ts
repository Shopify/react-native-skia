// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CanvasKitInit from "canvaskit-wasm/bin/full/canvaskit";
import type { CanvasKit as CanvasKitType } from "canvaskit-wasm";

declare global {
  var CanvasKit: CanvasKitType;
}

const CanvasKit = await CanvasKitInit();
global.CanvasKit = CanvasKit;
