"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BlendMode = void 0;
/**
 *  Blends are operators that take in two colors (source, destination) and
 * return a new color. Many of these operate the same on all 4 components: red,
 * green, blue, alpha. For these, we just document what happens to one
 * component, rather than naming each one separately.
 *
 *  Different SkColorTypes have different representations for color components:
 *      8-bit: 0..255
 *      6-bit: 0..63
 *      5-bit: 0..31
 *      4-bit: 0..15
 *     floats: 0...1
 *
 *  The documentation is expressed as if the component values are always 0..1
 * (floats).
 *
 *  For brevity, the documentation uses the following abbreviations
 *  s  : source
 *  d  : destination
 *  sa : source alpha
 *  da : destination alpha
 *
 *  Results are abbreviated
 *  r  : if all 4 components are computed in the same manner
 *  ra : result alpha component
 *  rc : result "color": red, green, blue components
 */
let BlendMode = exports.BlendMode = /*#__PURE__*/function (BlendMode) {
  BlendMode[BlendMode["Clear"] = 0] = "Clear";
  //!< r = 0
  BlendMode[BlendMode["Src"] = 1] = "Src";
  //!< r = s
  BlendMode[BlendMode["Dst"] = 2] = "Dst";
  //!< r = d
  BlendMode[BlendMode["SrcOver"] = 3] = "SrcOver";
  //!< r = s + (1-sa)*d
  BlendMode[BlendMode["DstOver"] = 4] = "DstOver";
  //!< r = d + (1-da)*s
  BlendMode[BlendMode["SrcIn"] = 5] = "SrcIn";
  //!< r = s * da
  BlendMode[BlendMode["DstIn"] = 6] = "DstIn";
  //!< r = d * sa
  BlendMode[BlendMode["SrcOut"] = 7] = "SrcOut";
  //!< r = s * (1-da)
  BlendMode[BlendMode["DstOut"] = 8] = "DstOut";
  //!< r = d * (1-sa)
  BlendMode[BlendMode["SrcATop"] = 9] = "SrcATop";
  //!< r = s*da + d*(1-sa)
  BlendMode[BlendMode["DstATop"] = 10] = "DstATop";
  //!< r = d*sa + s*(1-da)
  BlendMode[BlendMode["Xor"] = 11] = "Xor";
  //!< r = s*(1-da) + d*(1-sa)
  BlendMode[BlendMode["Plus"] = 12] = "Plus";
  //!< r = min(s + d, 1)
  BlendMode[BlendMode["Modulate"] = 13] = "Modulate";
  //!< r = s*d
  BlendMode[BlendMode["Screen"] = 14] = "Screen";
  //!< r = s + d - s*d
  BlendMode[BlendMode["Overlay"] = 15] = "Overlay";
  //!< multiply or screen, depending on destination
  BlendMode[BlendMode["Darken"] = 16] = "Darken";
  //!< rc = s + d - max(s*da, d*sa), ra = kSrcOver
  BlendMode[BlendMode["Lighten"] = 17] = "Lighten";
  //!< rc = s + d - min(s*da, d*sa), ra = kSrcOver
  BlendMode[BlendMode["ColorDodge"] = 18] = "ColorDodge";
  //!< brighten destination to reflect source
  BlendMode[BlendMode["ColorBurn"] = 19] = "ColorBurn";
  //!< darken destination to reflect source
  BlendMode[BlendMode["HardLight"] = 20] = "HardLight";
  //!< multiply or screen, depending on source
  BlendMode[BlendMode["SoftLight"] = 21] = "SoftLight";
  //!< lighten or darken, depending on source
  BlendMode[BlendMode["Difference"] = 22] = "Difference";
  //!< rc = s + d - 2*(min(s*da, d*sa)), ra = kSrcOver
  BlendMode[BlendMode["Exclusion"] = 23] = "Exclusion";
  //!< rc = s + d - two(s*d), ra = kSrcOver
  BlendMode[BlendMode["Multiply"] = 24] = "Multiply";
  //!< r = s*(1-da) + d*(1-sa) + s*d
  BlendMode[BlendMode["Hue"] = 25] = "Hue";
  //!< hue of source with saturation and luminosity of destination
  BlendMode[BlendMode["Saturation"] = 26] = "Saturation";
  //!< saturation of source with hue and luminosity of
  //!< destination
  BlendMode[BlendMode["Color"] = 27] = "Color";
  //!< hue and saturation of source with luminosity of destination
  BlendMode[BlendMode["Luminosity"] = 28] = "Luminosity"; //!< luminosity of source with hue and saturation of
  return BlendMode;
}({});
//# sourceMappingURL=BlendMode.js.map