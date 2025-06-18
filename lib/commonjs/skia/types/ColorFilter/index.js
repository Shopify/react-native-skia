"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _ColorFilter = require("./ColorFilter");
Object.keys(_ColorFilter).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ColorFilter[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ColorFilter[key];
    }
  });
});
var _ColorFilterFactory = require("./ColorFilterFactory");
Object.keys(_ColorFilterFactory).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ColorFilterFactory[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ColorFilterFactory[key];
    }
  });
});
//# sourceMappingURL=index.js.map