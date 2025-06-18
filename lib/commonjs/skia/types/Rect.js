"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isRect = void 0;
const isRect = def => {
  "worklet";

  if (typeof def === "object" && def !== null) {
    const rect = def;
    return typeof rect.x === "number" && typeof rect.y === "number" && typeof rect.width === "number" && typeof rect.height === "number";
  }
  return false;
};
exports.isRect = isRect;
//# sourceMappingURL=Rect.js.map