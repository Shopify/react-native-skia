"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkTypefaceFontProviderFactory = void 0;
var _Host = require("./Host");
var _JsiSkTypefaceFontProvider = require("./JsiSkTypefaceFontProvider");
class JsiSkTypefaceFontProviderFactory extends _Host.Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  Make() {
    const tf = this.CanvasKit.TypefaceFontProvider.Make();
    return new _JsiSkTypefaceFontProvider.JsiSkTypefaceFontProvider(this.CanvasKit, tf);
  }
}
exports.JsiSkTypefaceFontProviderFactory = JsiSkTypefaceFontProviderFactory;
//# sourceMappingURL=JsiSkTypefaceFontProviderFactory.js.map