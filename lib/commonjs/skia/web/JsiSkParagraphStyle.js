"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkParagraphStyle = void 0;
var _types = require("../types");
class JsiSkParagraphStyle {
  static toParagraphStyle(ck, value) {
    var _value$disableHinting, _value$ellipsis, _value$heightMultipli, _value$maxLines, _value$replaceTabChar, _ps$strutStyle, _value$strutStyle$fon, _value$strutStyle, _value$strutStyle$fon2, _value$strutStyle2, _value$strutStyle$hei, _value$strutStyle3, _value$strutStyle$lea, _value$strutStyle4, _value$strutStyle$for, _value$strutStyle5, _ps$strutStyle$fontSt, _value$strutStyle6, _value$strutStyle7, _value$strutStyle8, _value$strutStyle$hal, _value$strutStyle9, _value$strutStyle$str, _value$strutStyle10;
    // Seems like we need to provide the textStyle.color value, otherwise
    // the constructor crashes.
    const ps = new ck.ParagraphStyle({
      textStyle: {
        color: ck.BLACK
      }
    });
    ps.disableHinting = (_value$disableHinting = value.disableHinting) !== null && _value$disableHinting !== void 0 ? _value$disableHinting : ps.disableHinting;
    ps.ellipsis = (_value$ellipsis = value.ellipsis) !== null && _value$ellipsis !== void 0 ? _value$ellipsis : ps.ellipsis;
    ps.heightMultiplier = (_value$heightMultipli = value.heightMultiplier) !== null && _value$heightMultipli !== void 0 ? _value$heightMultipli : ps.heightMultiplier;
    ps.maxLines = (_value$maxLines = value.maxLines) !== null && _value$maxLines !== void 0 ? _value$maxLines : ps.maxLines;
    ps.replaceTabCharacters = (_value$replaceTabChar = value.replaceTabCharacters) !== null && _value$replaceTabChar !== void 0 ? _value$replaceTabChar : ps.replaceTabCharacters;
    ps.textAlign = value.textAlign !== undefined ? {
      value: value.textAlign
    } : ps.textAlign;
    ps.textDirection = value.textDirection !== undefined ? {
      value: value.textDirection === _types.TextDirection.LTR ? 1 : 0
    } : ps.textDirection;
    ps.textHeightBehavior = value.textHeightBehavior !== undefined ? {
      value: value.textHeightBehavior
    } : ps.textHeightBehavior;
    ps.strutStyle = (_ps$strutStyle = ps.strutStyle) !== null && _ps$strutStyle !== void 0 ? _ps$strutStyle : {};
    ps.strutStyle.fontFamilies = (_value$strutStyle$fon = (_value$strutStyle = value.strutStyle) === null || _value$strutStyle === void 0 ? void 0 : _value$strutStyle.fontFamilies) !== null && _value$strutStyle$fon !== void 0 ? _value$strutStyle$fon : ps.strutStyle.fontFamilies;
    ps.strutStyle.fontSize = (_value$strutStyle$fon2 = (_value$strutStyle2 = value.strutStyle) === null || _value$strutStyle2 === void 0 ? void 0 : _value$strutStyle2.fontSize) !== null && _value$strutStyle$fon2 !== void 0 ? _value$strutStyle$fon2 : ps.strutStyle.fontSize;
    ps.strutStyle.heightMultiplier = (_value$strutStyle$hei = (_value$strutStyle3 = value.strutStyle) === null || _value$strutStyle3 === void 0 ? void 0 : _value$strutStyle3.heightMultiplier) !== null && _value$strutStyle$hei !== void 0 ? _value$strutStyle$hei : ps.strutStyle.heightMultiplier;
    ps.strutStyle.leading = (_value$strutStyle$lea = (_value$strutStyle4 = value.strutStyle) === null || _value$strutStyle4 === void 0 ? void 0 : _value$strutStyle4.leading) !== null && _value$strutStyle$lea !== void 0 ? _value$strutStyle$lea : ps.strutStyle.leading;
    ps.strutStyle.forceStrutHeight = (_value$strutStyle$for = (_value$strutStyle5 = value.strutStyle) === null || _value$strutStyle5 === void 0 ? void 0 : _value$strutStyle5.forceStrutHeight) !== null && _value$strutStyle$for !== void 0 ? _value$strutStyle$for : ps.strutStyle.forceStrutHeight;
    ps.strutStyle.fontStyle = (_ps$strutStyle$fontSt = ps.strutStyle.fontStyle) !== null && _ps$strutStyle$fontSt !== void 0 ? _ps$strutStyle$fontSt : {};
    ps.strutStyle.fontStyle.slant = ((_value$strutStyle6 = value.strutStyle) === null || _value$strutStyle6 === void 0 || (_value$strutStyle6 = _value$strutStyle6.fontStyle) === null || _value$strutStyle6 === void 0 ? void 0 : _value$strutStyle6.slant) !== undefined ? {
      value: value.strutStyle.fontStyle.slant
    } : ps.strutStyle.fontStyle.slant;
    ps.strutStyle.fontStyle.width = ((_value$strutStyle7 = value.strutStyle) === null || _value$strutStyle7 === void 0 || (_value$strutStyle7 = _value$strutStyle7.fontStyle) === null || _value$strutStyle7 === void 0 ? void 0 : _value$strutStyle7.width) !== undefined ? {
      value: value.strutStyle.fontStyle.width
    } : ps.strutStyle.fontStyle.width;
    ps.strutStyle.fontStyle.weight = ((_value$strutStyle8 = value.strutStyle) === null || _value$strutStyle8 === void 0 || (_value$strutStyle8 = _value$strutStyle8.fontStyle) === null || _value$strutStyle8 === void 0 ? void 0 : _value$strutStyle8.weight) !== undefined ? {
      value: value.strutStyle.fontStyle.weight
    } : ps.strutStyle.fontStyle.weight;
    ps.strutStyle.halfLeading = (_value$strutStyle$hal = (_value$strutStyle9 = value.strutStyle) === null || _value$strutStyle9 === void 0 ? void 0 : _value$strutStyle9.halfLeading) !== null && _value$strutStyle$hal !== void 0 ? _value$strutStyle$hal : ps.strutStyle.halfLeading;
    ps.strutStyle.strutEnabled = (_value$strutStyle$str = (_value$strutStyle10 = value.strutStyle) === null || _value$strutStyle10 === void 0 ? void 0 : _value$strutStyle10.strutEnabled) !== null && _value$strutStyle$str !== void 0 ? _value$strutStyle$str : ps.strutStyle.strutEnabled;
    return ps;
  }
}
exports.JsiSkParagraphStyle = JsiSkParagraphStyle;
//# sourceMappingURL=JsiSkParagraphStyle.js.map