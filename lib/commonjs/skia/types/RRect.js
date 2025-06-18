"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isRRect = void 0;
// We have an issue to check property existence on JSI backed instances
const isRRect = def => {
  "worklet";

  return typeof def === "object" && def !== null &&
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof def.rect === "object";
};
exports.isRRect = isRRect;
//# sourceMappingURL=RRect.js.map