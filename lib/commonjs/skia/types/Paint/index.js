"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Paint = require("./Paint");
Object.keys(_Paint).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Paint[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Paint[key];
    }
  });
});
var _BlendMode = require("./BlendMode");
Object.keys(_BlendMode).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _BlendMode[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _BlendMode[key];
    }
  });
});
//# sourceMappingURL=index.js.map