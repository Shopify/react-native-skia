export let TileMode = /*#__PURE__*/function (TileMode) {
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
export const isImageFilter = obj => obj !== null && obj.__typename__ === "ImageFilter";
//# sourceMappingURL=ImageFilter.js.map