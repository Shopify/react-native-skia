"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPathEffect = exports.Path1DEffectStyle = void 0;
const isPathEffect = obj => obj !== null && obj.__typename__ === "PathEffect";
exports.isPathEffect = isPathEffect;
let Path1DEffectStyle = exports.Path1DEffectStyle = /*#__PURE__*/function (Path1DEffectStyle) {
  Path1DEffectStyle[Path1DEffectStyle["Translate"] = 0] = "Translate";
  Path1DEffectStyle[Path1DEffectStyle["Rotate"] = 1] = "Rotate";
  Path1DEffectStyle[Path1DEffectStyle["Morph"] = 2] = "Morph";
  return Path1DEffectStyle;
}({});
//# sourceMappingURL=PathEffect.js.map