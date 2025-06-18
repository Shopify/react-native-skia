"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Path = require("./Path");
Object.keys(_Path).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Path[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Path[key];
    }
  });
});
var _PathFactory = require("./PathFactory");
Object.keys(_PathFactory).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _PathFactory[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _PathFactory[key];
    }
  });
});
//# sourceMappingURL=index.js.map