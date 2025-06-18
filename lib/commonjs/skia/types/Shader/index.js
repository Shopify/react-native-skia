"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Shader = require("./Shader");
Object.keys(_Shader).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Shader[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Shader[key];
    }
  });
});
var _ShaderFactory = require("./ShaderFactory");
Object.keys(_ShaderFactory).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ShaderFactory[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ShaderFactory[key];
    }
  });
});
//# sourceMappingURL=index.js.map