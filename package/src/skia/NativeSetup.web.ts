// Setup CanvasKit for use in the browser.
import type { CanvasKit } from "canvaskit-wasm";

declare global {
  var CanvasKit: CanvasKit;
}
