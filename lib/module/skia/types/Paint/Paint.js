export let PaintStyle = /*#__PURE__*/function (PaintStyle) {
  PaintStyle[PaintStyle["Fill"] = 0] = "Fill";
  PaintStyle[PaintStyle["Stroke"] = 1] = "Stroke";
  return PaintStyle;
}({});
export let StrokeCap = /*#__PURE__*/function (StrokeCap) {
  StrokeCap[StrokeCap["Butt"] = 0] = "Butt";
  StrokeCap[StrokeCap["Round"] = 1] = "Round";
  StrokeCap[StrokeCap["Square"] = 2] = "Square";
  return StrokeCap;
}({});
export let StrokeJoin = /*#__PURE__*/function (StrokeJoin) {
  StrokeJoin[StrokeJoin["Miter"] = 0] = "Miter";
  StrokeJoin[StrokeJoin["Round"] = 1] = "Round";
  StrokeJoin[StrokeJoin["Bevel"] = 2] = "Bevel";
  return StrokeJoin;
}({});
export const isPaint = obj => obj !== null && obj.__typename__ === "Paint";
//# sourceMappingURL=Paint.js.map