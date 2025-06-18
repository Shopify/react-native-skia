"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkRuntimeEffectFactory = void 0;
var _Host = require("./Host");
var _JsiSkRuntimeEffect = require("./JsiSkRuntimeEffect");
class JsiSkRuntimeEffectFactory extends _Host.Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  Make(sksl) {
    const re = this.CanvasKit.RuntimeEffect.Make(sksl);
    if (re === null) {
      return null;
    }
    return new _JsiSkRuntimeEffect.JsiSkRuntimeEffect(this.CanvasKit, re, sksl);
  }
}
exports.JsiSkRuntimeEffectFactory = JsiSkRuntimeEffectFactory;
//# sourceMappingURL=JsiSkRuntimeEffectFactory.js.map