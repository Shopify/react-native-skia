"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _interpolate = require("./interpolate");
Object.keys(_interpolate).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _interpolate[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _interpolate[key];
    }
  });
});
var _interpolateColors = require("./interpolateColors");
Object.keys(_interpolateColors).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _interpolateColors[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _interpolateColors[key];
    }
  });
});
var _interpolateVector = require("./interpolateVector");
Object.keys(_interpolateVector).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _interpolateVector[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _interpolateVector[key];
    }
  });
});
var _interpolatePaths = require("./interpolatePaths");
Object.keys(_interpolatePaths).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _interpolatePaths[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _interpolatePaths[key];
    }
  });
});
//# sourceMappingURL=index.js.map