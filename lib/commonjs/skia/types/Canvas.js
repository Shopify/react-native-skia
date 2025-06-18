"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SaveLayerFlag = exports.ClipOp = void 0;
let ClipOp = exports.ClipOp = /*#__PURE__*/function (ClipOp) {
  ClipOp[ClipOp["Difference"] = 0] = "Difference";
  ClipOp[ClipOp["Intersect"] = 1] = "Intersect";
  return ClipOp;
}({});
let SaveLayerFlag = exports.SaveLayerFlag = /*#__PURE__*/function (SaveLayerFlag) {
  SaveLayerFlag[SaveLayerFlag["SaveLayerInitWithPrevious"] = 4] = "SaveLayerInitWithPrevious";
  SaveLayerFlag[SaveLayerFlag["SaveLayerF16ColorType"] = 16] = "SaveLayerF16ColorType";
  return SaveLayerFlag;
}({});
//# sourceMappingURL=Canvas.js.map