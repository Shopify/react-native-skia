"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMaskFilter = exports.BlurStyle = void 0;
let BlurStyle = exports.BlurStyle = /*#__PURE__*/function (BlurStyle) {
  BlurStyle[BlurStyle["Normal"] = 0] = "Normal";
  //!< fuzzy inside and outside
  BlurStyle[BlurStyle["Solid"] = 1] = "Solid";
  //!< solid inside, fuzzy outside
  BlurStyle[BlurStyle["Outer"] = 2] = "Outer";
  //!< nothing inside, fuzzy outside
  BlurStyle[BlurStyle["Inner"] = 3] = "Inner"; //!< fuzzy inside, nothing outside
  return BlurStyle;
}({});
const isMaskFilter = obj => obj !== null && obj.__typename__ === "MaskFilter";

/**
 * See SkMaskFilter.h for more details.
 */
exports.isMaskFilter = isMaskFilter;
//# sourceMappingURL=MaskFilter.js.map