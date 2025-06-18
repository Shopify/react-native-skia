"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Typeface = require("./Typeface");
Object.keys(_Typeface).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Typeface[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Typeface[key];
    }
  });
});
var _TypefaceFactory = require("./TypefaceFactory");
Object.keys(_TypefaceFactory).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _TypefaceFactory[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _TypefaceFactory[key];
    }
  });
});
//# sourceMappingURL=index.js.map