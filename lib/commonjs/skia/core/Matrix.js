"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processTransform2d = void 0;
var _Skia = require("../Skia");
var _types = require("../types");
const processTransform2d = transforms => {
  "worklet";

  return (0, _types.processTransform)(_Skia.Skia.Matrix(), transforms);
};
exports.processTransform2d = processTransform2d;
//# sourceMappingURL=Matrix.js.map