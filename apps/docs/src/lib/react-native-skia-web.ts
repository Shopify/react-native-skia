// Only the CanvasKit loader: importing anything else from Skia before
// CanvasKit is loaded would bind the Skia API to an undefined CanvasKit.
export { LoadSkiaWeb } from "../../../../packages/skia/src/web/LoadSkiaWeb";
