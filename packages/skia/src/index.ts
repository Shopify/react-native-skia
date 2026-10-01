import "./skia/NativeSetup";
export { JsiSkImage } from "./skia/web/JsiSkImage";
export * from "./renderer";
// TEMPORARY (testing): Canvas2 is exported as Canvas so that every example
// and test runs on the Graphite view; the previous canvas is CanvasOld.
// Revert to `export * from "./renderer/Canvas"; export * from "./renderer/Canvas2";`
export {
  Canvas as CanvasOld,
  useCanvasRef,
  useCanvasSize,
} from "./renderer/Canvas";
export type { CanvasProps, CanvasRef } from "./renderer/Canvas";
export { Canvas2 as Canvas, Canvas2 } from "./renderer/Canvas2";
export * from "./renderer/Offscreen";
export * from "./views";
export * from "./skia";
export * from "./external";
export * from "./animation";
export * from "./dom/types";
export * from "./dom/nodes";
