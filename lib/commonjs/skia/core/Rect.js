"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.topRight = exports.topLeft = exports.rect = exports.center = exports.bounds = exports.bottomRight = exports.bottomLeft = void 0;
var _Skia = require("../Skia");
var _types = require("../types");
var _Vector = require("./Vector");
const rect = (x, y, width, height) => {
  "worklet";

  return _Skia.Skia.XYWHRect(x, y, width, height);
};
exports.rect = rect;
const bounds = rects => {
  "worklet";

  const x = Math.min(...rects.map(r => r.x));
  const y = Math.min(...rects.map(r => r.y));
  const width = Math.max(...rects.map(r => r.x + r.width));
  const height = Math.max(...rects.map(r => r.y + r.height));
  return rect(x, y, width - x, height - y);
};
exports.bounds = bounds;
const topLeft = r => {
  "worklet";

  return (0, _types.isRRect)(r) ? (0, _Vector.vec)(r.rect.x, r.rect.y) : (0, _Vector.vec)(r.x, r.y);
};
exports.topLeft = topLeft;
const topRight = r => {
  "worklet";

  return (0, _types.isRRect)(r) ? (0, _Vector.vec)(r.rect.x + r.rect.width, r.rect.y) : (0, _Vector.vec)(r.x + r.width, r.y);
};
exports.topRight = topRight;
const bottomLeft = r => {
  "worklet";

  return (0, _types.isRRect)(r) ? (0, _Vector.vec)(r.rect.x, r.rect.y + r.rect.height) : (0, _Vector.vec)(r.x, r.y + r.height);
};
exports.bottomLeft = bottomLeft;
const bottomRight = r => {
  "worklet";

  return (0, _types.isRRect)(r) ? (0, _Vector.vec)(r.rect.x + r.rect.width, r.rect.y + r.rect.height) : (0, _Vector.vec)(r.x + r.width, r.y + r.height);
};
exports.bottomRight = bottomRight;
const center = r => {
  "worklet";

  return (0, _types.isRRect)(r) ? (0, _Vector.vec)(r.rect.x + r.rect.width / 2, r.rect.y + r.rect.height / 2) : (0, _Vector.vec)(r.x + r.width / 2, r.y + r.height / 2);
};
exports.center = center;
//# sourceMappingURL=Rect.js.map