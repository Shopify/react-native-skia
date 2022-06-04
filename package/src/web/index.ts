import CanvasKitInit from "canvaskit-wasm";

export const LoadSkia = async () => {
  const CanvasKit = await CanvasKitInit();
  // The CanvasKit API is stored on the global object and used
  // to create the JsiSKApi in the Skia.web.ts file.
  global.CanvasKit = CanvasKit;
};
