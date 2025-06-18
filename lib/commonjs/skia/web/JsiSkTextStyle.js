"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkTextStyle = void 0;
class JsiSkTextStyle {
  static toTextStyle(value) {
    return {
      backgroundColor: value.backgroundColor,
      color: value.color,
      decoration: value.decoration,
      decorationColor: value.decorationColor,
      decorationStyle: value.decorationStyle ? {
        value: value.decorationStyle
      } : undefined,
      decorationThickness: value.decorationThickness,
      fontFamilies: value.fontFamilies,
      fontSize: value.fontSize,
      fontStyle: value.fontStyle ? {
        slant: value.fontStyle.slant ? {
          value: value.fontStyle.slant
        } : undefined,
        weight: value.fontStyle.weight ? {
          value: value.fontStyle.weight
        } : undefined,
        width: value.fontStyle.width ? {
          value: value.fontStyle.width
        } : undefined
      } : undefined,
      fontFeatures: value.fontFeatures,
      foregroundColor: value.foregroundColor,
      fontVariations: value.fontVariations,
      halfLeading: value.halfLeading,
      heightMultiplier: value.heightMultiplier,
      letterSpacing: value.letterSpacing,
      locale: value.locale,
      shadows: value.shadows ? value.shadows.map(shadow => ({
        blurRadius: shadow.blurRadius,
        color: shadow.color,
        offset: shadow.offset ? [shadow.offset.x, shadow.offset.y] : undefined
      })) : undefined,
      textBaseline: value.textBaseline ? {
        value: value.textBaseline
      } : undefined,
      wordSpacing: value.wordSpacing
    };
  }
}
exports.JsiSkTextStyle = JsiSkTextStyle;
//# sourceMappingURL=JsiSkTextStyle.js.map