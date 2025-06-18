"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _functions = require("./functions");
Object.keys(_functions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _functions[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _functions[key];
    }
  });
});
//# sourceMappingURL=index.js.map