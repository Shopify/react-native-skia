"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkTypefaceFactory = void 0;
var _Host = require("./Host");
var _JsiSkTypeface = require("./JsiSkTypeface");
class JsiSkTypefaceFactory extends _Host.Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeFreeTypeFaceFromData(data) {
    const tf = this.CanvasKit.Typeface.MakeFreeTypeFaceFromData(_JsiSkTypeface.JsiSkTypeface.fromValue(data));
    if (tf === null) {
      return null;
    }
    return new _JsiSkTypeface.JsiSkTypeface(this.CanvasKit, tf);
  }
}
exports.JsiSkTypefaceFactory = JsiSkTypefaceFactory;
//# sourceMappingURL=JsiSkTypefaceFactory.js.map