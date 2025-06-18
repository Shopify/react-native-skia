"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MakeVertices = void 0;
var _JsiSkVertices = require("./JsiSkVertices");
var _Host = require("./Host");
const concat = (...arrays) => {
  let totalLength = 0;
  for (const arr of arrays) {
    totalLength += arr.length;
  }
  const result = new Float32Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
};
const MakeVertices = (CanvasKit, mode, positions, textureCoordinates, colors, indices, isVolatile) => new _JsiSkVertices.JsiSkVertices(CanvasKit, CanvasKit.MakeVertices((0, _Host.getEnum)(CanvasKit, "VertexMode", mode), positions.map(({
  x,
  y
}) => [x, y]).flat(), (textureCoordinates || []).map(({
  x,
  y
}) => [x, y]).flat(), !colors ? null : colors.reduce((a, c) => concat(a, c)), indices, isVolatile));
exports.MakeVertices = MakeVertices;
//# sourceMappingURL=JsiSkVerticesFactory.js.map