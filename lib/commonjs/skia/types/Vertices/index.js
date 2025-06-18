"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Vertices = require("./Vertices");
Object.keys(_Vertices).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Vertices[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Vertices[key];
    }
  });
});
//# sourceMappingURL=index.js.map