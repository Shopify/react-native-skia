"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Data = require("./Data");
Object.keys(_Data).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Data[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Data[key];
    }
  });
});
var _DataFactory = require("./DataFactory");
Object.keys(_DataFactory).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _DataFactory[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _DataFactory[key];
    }
  });
});
//# sourceMappingURL=index.js.map