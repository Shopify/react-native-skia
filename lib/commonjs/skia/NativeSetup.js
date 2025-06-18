"use strict";

var _Platform = require("../Platform");
var _NativeSkiaModule = _interopRequireDefault(require("../specs/NativeSkiaModule"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
if (_Platform.Platform.OS !== "web" && global.SkiaApi == null) {
  // Initialize RN Skia
  const SkiaModule = _NativeSkiaModule.default;
  if (SkiaModule == null || typeof SkiaModule.install !== "function") {
    throw new Error("Native RNSkia Module cannot be found! Make sure you correctly " + "installed native dependencies and rebuilt your app.");
  }
  const result = SkiaModule.install();
  if (result !== true) {
    throw new Error(`Native Skia Module failed to correctly install JSI Bindings! Result: ${result}`);
  }
}
//# sourceMappingURL=NativeSetup.js.map