"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Surface = require("./Surface");
Object.keys(_Surface).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Surface[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Surface[key];
    }
  });
});
var _SurfaceFactory = require("./SurfaceFactory");
Object.keys(_SurfaceFactory).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _SurfaceFactory[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _SurfaceFactory[key];
    }
  });
});
//# sourceMappingURL=index.js.map