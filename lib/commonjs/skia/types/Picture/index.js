"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Picture = require("./Picture");
Object.keys(_Picture).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Picture[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Picture[key];
    }
  });
});
var _PictureRecorder = require("./PictureRecorder");
Object.keys(_PictureRecorder).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _PictureRecorder[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _PictureRecorder[key];
    }
  });
});
var _PictureFactory = require("./PictureFactory");
Object.keys(_PictureFactory).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _PictureFactory[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _PictureFactory[key];
    }
  });
});
//# sourceMappingURL=index.js.map