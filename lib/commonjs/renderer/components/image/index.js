"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Image = require("./Image");
Object.keys(_Image).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Image[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Image[key];
    }
  });
});
var _ImageShader = require("./ImageShader");
Object.keys(_ImageShader).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ImageShader[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ImageShader[key];
    }
  });
});
var _ImageSVG = require("./ImageSVG");
Object.keys(_ImageSVG).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ImageSVG[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ImageSVG[key];
    }
  });
});
//# sourceMappingURL=index.js.map