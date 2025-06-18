"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _SVG = require("./SVG");
Object.keys(_SVG).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _SVG[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _SVG[key];
    }
  });
});
var _SVGFactory = require("./SVGFactory");
Object.keys(_SVGFactory).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _SVGFactory[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _SVGFactory[key];
    }
  });
});
//# sourceMappingURL=index.js.map