"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isImageFilter = exports.TileMode = void 0;
let TileMode = exports.TileMode = /*#__PURE__*/function (TileMode) {
  /**
   *  Replicate the edge color if the shader draws outside of its
   *  original bounds.
   */
  TileMode[TileMode["Clamp"] = 0] = "Clamp";
  /**
   *  Repeat the shader's image horizontally and vertically.
   */
  TileMode[TileMode["Repeat"] = 1] = "Repeat";
  /**
   *  Repeat the shader's image horizontally and vertically, alternating
   *  mirror images so that adjacent images always seam.
   */
  TileMode[TileMode["Mirror"] = 2] = "Mirror";
  /**
   *  Only draw within the original domain, return transparent-black everywhere else.
   */
  TileMode[TileMode["Decal"] = 3] = "Decal";
  return TileMode;
}({});
const isImageFilter = obj => obj !== null && obj.__typename__ === "ImageFilter";
exports.isImageFilter = isImageFilter;
//# sourceMappingURL=ImageFilter.js.map