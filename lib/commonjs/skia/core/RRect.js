"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rrect = void 0;
var _Skia = require("../Skia");
const rrect = (r, rx, ry) => {
  "worklet";

  return _Skia.Skia.RRectXY(r, rx, ry);
};
exports.rrect = rrect;
//# sourceMappingURL=RRect.js.map