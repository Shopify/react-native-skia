// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CanvasKitInit from "canvaskit-wasm/bin/full/canvaskit";
let ckSharedPromise;
export const LoadSkiaWeb = async opts => {
  var _ckSharedPromise;
  if (global.CanvasKit !== undefined) {
    return;
  }
  ckSharedPromise = (_ckSharedPromise = ckSharedPromise) !== null && _ckSharedPromise !== void 0 ? _ckSharedPromise : CanvasKitInit(opts);
  const CanvasKit = await ckSharedPromise;
  // The CanvasKit API is stored on the global object and used
  // to create the JsiSKApi in the Skia.web.ts file.
  global.CanvasKit = CanvasKit;
};

// We keep this function for backward compatibility
export const LoadSkia = LoadSkiaWeb;
//# sourceMappingURL=LoadSkiaWeb.js.map