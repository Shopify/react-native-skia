"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkFontMgrFactory = void 0;
var _Host = require("./Host");
var _JsiSkFontMgr = require("./JsiSkFontMgr");
class JsiSkFontMgrFactory extends _Host.Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  System() {
    const fontMgr = this.CanvasKit.TypefaceFontProvider.Make();
    if (!fontMgr) {
      throw new Error("Couldn't create system font manager");
    }
    return new _JsiSkFontMgr.JsiSkFontMgr(this.CanvasKit, fontMgr);
  }
}
exports.JsiSkFontMgrFactory = JsiSkFontMgrFactory;
//# sourceMappingURL=JsiSkFontMgrFactory.js.map