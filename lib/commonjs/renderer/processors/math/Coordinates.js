"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.polar2Cartesian = exports.polar2Canvas = exports.cartesian2Polar = exports.cartesian2Canvas = exports.canvas2Polar = exports.canvas2Cartesian = void 0;
const canvas2Cartesian = (v, center) => {
  "worklet";

  return {
    x: v.x - center.x,
    y: -1 * (v.y - center.y)
  };
};
exports.canvas2Cartesian = canvas2Cartesian;
const cartesian2Canvas = (v, center) => {
  "worklet";

  return {
    x: v.x + center.x,
    y: -1 * v.y + center.y
  };
};
exports.cartesian2Canvas = cartesian2Canvas;
const cartesian2Polar = v => {
  "worklet";

  return {
    theta: Math.atan2(v.y, v.x),
    radius: Math.sqrt(v.x ** 2 + v.y ** 2)
  };
};
exports.cartesian2Polar = cartesian2Polar;
const polar2Cartesian = p => {
  "worklet";

  return {
    x: p.radius * Math.cos(p.theta),
    y: p.radius * Math.sin(p.theta)
  };
};
exports.polar2Cartesian = polar2Cartesian;
const polar2Canvas = (p, center) => {
  "worklet";

  return cartesian2Canvas(polar2Cartesian(p), center);
};
exports.polar2Canvas = polar2Canvas;
const canvas2Polar = (v, center) => {
  "worklet";

  return cartesian2Polar(canvas2Cartesian(v, center));
};
exports.canvas2Polar = canvas2Polar;
//# sourceMappingURL=Coordinates.js.map