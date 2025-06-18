"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vec = exports.sub = exports.point = exports.neg = exports.dist = exports.add = void 0;
var _Skia = require("../Skia");
const vec = (x = 0, y) => {
  "worklet";

  return _Skia.Skia.Point(x, y !== null && y !== void 0 ? y : x);
};
exports.vec = vec;
const point = exports.point = vec;
const neg = a => {
  "worklet";

  return vec(-a.x, -a.y);
};
exports.neg = neg;
const add = (a, b) => {
  "worklet";

  return vec(a.x + b.x, a.y + b.y);
};
exports.add = add;
const sub = (a, b) => {
  "worklet";

  return vec(a.x - b.x, a.y - b.y);
};
exports.sub = sub;
const dist = (a, b) => {
  "worklet";

  return Math.hypot(a.x - b.x, a.y - b.y);
};
exports.dist = dist;
//# sourceMappingURL=Vector.js.map