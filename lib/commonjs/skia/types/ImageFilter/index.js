"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _ImageFilter = require("./ImageFilter");
Object.keys(_ImageFilter).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ImageFilter[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ImageFilter[key];
    }
  });
});
var _ImageFilterFactory = require("./ImageFilterFactory");
Object.keys(_ImageFilterFactory).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ImageFilterFactory[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ImageFilterFactory[key];
    }
  });
});
//# sourceMappingURL=index.js.map