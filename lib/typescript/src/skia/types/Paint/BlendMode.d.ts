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
export declare enum BlendMode {
    Clear = 0,//!< r = 0
    Src = 1,//!< r = s
    Dst = 2,//!< r = d
    SrcOver = 3,//!< r = s + (1-sa)*d
    DstOver = 4,//!< r = d + (1-da)*s
    SrcIn = 5,//!< r = s * da
    DstIn = 6,//!< r = d * sa
    SrcOut = 7,//!< r = s * (1-da)
    DstOut = 8,//!< r = d * (1-sa)
    SrcATop = 9,//!< r = s*da + d*(1-sa)
    DstATop = 10,//!< r = d*sa + s*(1-da)
    Xor = 11,//!< r = s*(1-da) + d*(1-sa)
    Plus = 12,//!< r = min(s + d, 1)
    Modulate = 13,//!< r = s*d
    Screen = 14,//!< r = s + d - s*d
    Overlay = 15,//!< multiply or screen, depending on destination
    Darken = 16,//!< rc = s + d - max(s*da, d*sa), ra = kSrcOver
    Lighten = 17,//!< rc = s + d - min(s*da, d*sa), ra = kSrcOver
    ColorDodge = 18,//!< brighten destination to reflect source
    ColorBurn = 19,//!< darken destination to reflect source
    HardLight = 20,//!< multiply or screen, depending on source
    SoftLight = 21,//!< lighten or darken, depending on source
    Difference = 22,//!< rc = s + d - 2*(min(s*da, d*sa)), ra = kSrcOver
    Exclusion = 23,//!< rc = s + d - two(s*d), ra = kSrcOver
    Multiply = 24,//!< r = s*(1-da) + d*(1-sa) + s*d
    Hue = 25,//!< hue of source with saturation and luminosity of destination
    Saturation = 26,//!< saturation of source with hue and luminosity of
    Color = 27,//!< hue and saturation of source with luminosity of destination
    Luminosity = 28
}
