"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _types = require("../types");
Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
var _datatypes = require("./datatypes");
Object.keys(_datatypes).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _datatypes[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _datatypes[key];
    }
  });
});
//# sourceMappingURL=index.js.map