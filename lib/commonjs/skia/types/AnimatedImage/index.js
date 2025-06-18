"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _AnimatedImage = require("./AnimatedImage");
Object.keys(_AnimatedImage).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _AnimatedImage[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _AnimatedImage[key];
    }
  });
});
var _AnimatedImageFactory = require("./AnimatedImageFactory");
Object.keys(_AnimatedImageFactory).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _AnimatedImageFactory[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _AnimatedImageFactory[key];
    }
  });
});
//# sourceMappingURL=index.js.map