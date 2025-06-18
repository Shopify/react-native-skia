"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkFontMgr = void 0;
var _Host = require("./Host");
class JsiSkFontMgr extends _Host.HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "FontMgr");
  }
  dispose() {
    this.ref.delete();
  }
  countFamilies() {
    return this.ref.countFamilies();
  }
  getFamilyName(index) {
    return this.ref.getFamilyName(index);
  }
  matchFamilyStyle(_familyName, _fontStyle) {
    return (0, _Host.throwNotImplementedOnRNWeb)();
  }
}
exports.JsiSkFontMgr = JsiSkFontMgr;
//# sourceMappingURL=JsiSkFontMgr.js.map