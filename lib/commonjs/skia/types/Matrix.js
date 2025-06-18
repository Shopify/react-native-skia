"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toDegrees = exports.processTransform = exports.isMatrix = void 0;
var _Matrix = require("./Matrix4");
const isMatrix = obj => obj !== null && obj.__typename__ === "Matrix";
exports.isMatrix = isMatrix;
const processTransform = (m, transforms) => {
  "worklet";

  const m3 = (0, _Matrix.processTransform3d)(transforms);
  m.concat(m3);
  return m;
};
exports.processTransform = processTransform;
const toDegrees = rad => {
  return rad * 180 / Math.PI;
};
exports.toDegrees = toDegrees;
//# sourceMappingURL=Matrix.js.map