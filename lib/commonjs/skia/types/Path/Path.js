"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPath = exports.PathVerb = exports.PathOp = exports.FillType = void 0;
/**
 * Options used for Path.stroke(). If an option is omitted, a sensible default will be used.
 */
let FillType = exports.FillType = /*#__PURE__*/function (FillType) {
  FillType[FillType["Winding"] = 0] = "Winding";
  FillType[FillType["EvenOdd"] = 1] = "EvenOdd";
  FillType[FillType["InverseWinding"] = 2] = "InverseWinding";
  FillType[FillType["InverseEvenOdd"] = 3] = "InverseEvenOdd";
  return FillType;
}({});
let PathOp = exports.PathOp = /*#__PURE__*/function (PathOp) {
  PathOp[PathOp["Difference"] = 0] = "Difference";
  //!< subtract the op path from the first path
  PathOp[PathOp["Intersect"] = 1] = "Intersect";
  //!< intersect the two paths
  PathOp[PathOp["Union"] = 2] = "Union";
  //!< union (inclusive-or) the two paths
  PathOp[PathOp["XOR"] = 3] = "XOR";
  //!< exclusive-or the two paths
  PathOp[PathOp["ReverseDifference"] = 4] = "ReverseDifference";
  return PathOp;
}({});
let PathVerb = exports.PathVerb = /*#__PURE__*/function (PathVerb) {
  PathVerb[PathVerb["Move"] = 0] = "Move";
  PathVerb[PathVerb["Line"] = 1] = "Line";
  PathVerb[PathVerb["Quad"] = 2] = "Quad";
  PathVerb[PathVerb["Conic"] = 3] = "Conic";
  PathVerb[PathVerb["Cubic"] = 4] = "Cubic";
  PathVerb[PathVerb["Close"] = 5] = "Close";
  return PathVerb;
}({});
const isPath = obj => {
  "worklet";

  return obj !== null && obj.__typename__ === "Path";
};
exports.isPath = isPath;
//# sourceMappingURL=Path.js.map