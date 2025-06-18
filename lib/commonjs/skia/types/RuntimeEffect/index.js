"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _RuntimeEffect = require("./RuntimeEffect");
Object.keys(_RuntimeEffect).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _RuntimeEffect[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _RuntimeEffect[key];
    }
  });
});
var _RuntimeEffectFactory = require("./RuntimeEffectFactory");
Object.keys(_RuntimeEffectFactory).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _RuntimeEffectFactory[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _RuntimeEffectFactory[key];
    }
  });
});
//# sourceMappingURL=index.js.map