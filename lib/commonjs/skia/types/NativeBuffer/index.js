"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _NativeBufferFactory = require("./NativeBufferFactory");
Object.keys(_NativeBufferFactory).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _NativeBufferFactory[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _NativeBufferFactory[key];
    }
  });
});
//# sourceMappingURL=index.js.map