"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPaint = exports.StrokeJoin = exports.StrokeCap = exports.PaintStyle = void 0;
let PaintStyle = exports.PaintStyle = /*#__PURE__*/function (PaintStyle) {
  PaintStyle[PaintStyle["Fill"] = 0] = "Fill";
  PaintStyle[PaintStyle["Stroke"] = 1] = "Stroke";
  return PaintStyle;
}({});
let StrokeCap = exports.StrokeCap = /*#__PURE__*/function (StrokeCap) {
  StrokeCap[StrokeCap["Butt"] = 0] = "Butt";
  StrokeCap[StrokeCap["Round"] = 1] = "Round";
  StrokeCap[StrokeCap["Square"] = 2] = "Square";
  return StrokeCap;
}({});
let StrokeJoin = exports.StrokeJoin = /*#__PURE__*/function (StrokeJoin) {
  StrokeJoin[StrokeJoin["Miter"] = 0] = "Miter";
  StrokeJoin[StrokeJoin["Round"] = 1] = "Round";
  StrokeJoin[StrokeJoin["Bevel"] = 2] = "Bevel";
  return StrokeJoin;
}({});
const isPaint = obj => obj !== null && obj.__typename__ === "Paint";
exports.isPaint = isPaint;
//# sourceMappingURL=Paint.js.map