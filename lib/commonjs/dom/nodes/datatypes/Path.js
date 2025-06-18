"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processPath = exports.isPathDef = void 0;
var _types = require("../../../skia/types");
const processPath = (Skia, rawPath) => {
  "worklet";

  const path = typeof rawPath === "string" ? Skia.Path.MakeFromSVGString(rawPath) : rawPath;
  if (!path) {
    throw new Error("Invalid path: " + rawPath);
  }
  return path;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.processPath = processPath;
const isPathDef = def => {
  "worklet";

  return typeof def === "string" || (0, _types.isPath)(def);
};
exports.isPathDef = isPathDef;
//# sourceMappingURL=Path.js.map