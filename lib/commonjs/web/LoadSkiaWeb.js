"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoadSkiaWeb = exports.LoadSkia = void 0;
var _canvaskit = _interopRequireDefault(require("canvaskit-wasm/bin/full/canvaskit"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

let ckSharedPromise;
const LoadSkiaWeb = async opts => {
  if (global.CanvasKit !== undefined) {
    return;
  }
  ckSharedPromise = ckSharedPromise !== null && ckSharedPromise !== void 0 ? ckSharedPromise : (0, _canvaskit.default)(opts);
  const CanvasKit = await ckSharedPromise;
  // The CanvasKit API is stored on the global object and used
  // to create the JsiSKApi in the Skia.web.ts file.
  global.CanvasKit = CanvasKit;
};

// We keep this function for backward compatibility
exports.LoadSkiaWeb = LoadSkiaWeb;
const LoadSkia = exports.LoadSkia = LoadSkiaWeb;
//# sourceMappingURL=LoadSkiaWeb.js.map