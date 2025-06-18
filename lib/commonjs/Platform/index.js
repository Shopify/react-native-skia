"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Platform = require("./Platform");
Object.keys(_Platform).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Platform[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Platform[key];
    }
  });
});
//# sourceMappingURL=index.js.map