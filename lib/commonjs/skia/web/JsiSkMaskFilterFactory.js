"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkMaskFilterFactory = void 0;
var _Host = require("./Host");
var _JsiSkMaskFilter = require("./JsiSkMaskFilter");
class JsiSkMaskFilterFactory extends _Host.Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeBlur(style, sigma, respectCTM) {
    return new _JsiSkMaskFilter.JsiSkMaskFilter(this.CanvasKit, this.CanvasKit.MaskFilter.MakeBlur((0, _Host.getEnum)(this.CanvasKit, "BlurStyle", style), sigma, respectCTM));
  }
}
exports.JsiSkMaskFilterFactory = JsiSkMaskFilterFactory;
//# sourceMappingURL=JsiSkMaskFilterFactory.js.map