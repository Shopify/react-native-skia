"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rotate = void 0;
var _Coordinates = require("./Coordinates");
const rotate = (tr, origin, rotation) => {
  "worklet";

  const {
    radius,
    theta
  } = (0, _Coordinates.canvas2Polar)(tr, origin);
  return (0, _Coordinates.polar2Canvas)({
    radius,
    theta: theta + rotation
  }, origin);
};
exports.rotate = rotate;
//# sourceMappingURL=Transforms.js.map