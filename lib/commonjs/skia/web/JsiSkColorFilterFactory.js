"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkColorFilterFactory = void 0;
var _Host = require("./Host");
var _JsiSkColorFilter = require("./JsiSkColorFilter");
class JsiSkColorFilterFactory extends _Host.Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeMatrix(cMatrix) {
    return new _JsiSkColorFilter.JsiSkColorFilter(this.CanvasKit, this.CanvasKit.ColorFilter.MakeMatrix(cMatrix));
  }
  MakeBlend(color, mode) {
    return new _JsiSkColorFilter.JsiSkColorFilter(this.CanvasKit, this.CanvasKit.ColorFilter.MakeBlend(color, (0, _Host.getEnum)(this.CanvasKit, "BlendMode", mode)));
  }
  MakeCompose(outer, inner) {
    return new _JsiSkColorFilter.JsiSkColorFilter(this.CanvasKit, this.CanvasKit.ColorFilter.MakeCompose(_JsiSkColorFilter.JsiSkColorFilter.fromValue(outer), _JsiSkColorFilter.JsiSkColorFilter.fromValue(inner)));
  }
  MakeLerp(t, dst, src) {
    return new _JsiSkColorFilter.JsiSkColorFilter(this.CanvasKit, this.CanvasKit.ColorFilter.MakeLerp(t, _JsiSkColorFilter.JsiSkColorFilter.fromValue(dst), _JsiSkColorFilter.JsiSkColorFilter.fromValue(src)));
  }
  MakeLinearToSRGBGamma() {
    return new _JsiSkColorFilter.JsiSkColorFilter(this.CanvasKit, this.CanvasKit.ColorFilter.MakeLinearToSRGBGamma());
  }
  MakeSRGBToLinearGamma() {
    return new _JsiSkColorFilter.JsiSkColorFilter(this.CanvasKit, this.CanvasKit.ColorFilter.MakeSRGBToLinearGamma());
  }
  MakeLumaColorFilter() {
    return new _JsiSkColorFilter.JsiSkColorFilter(this.CanvasKit, this.CanvasKit.ColorFilter.MakeLuma());
  }
}
exports.JsiSkColorFilterFactory = JsiSkColorFilterFactory;
//# sourceMappingURL=JsiSkColorFilterFactory.js.map