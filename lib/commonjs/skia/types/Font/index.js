"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _Font = require("./Font");
Object.keys(_Font).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Font[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Font[key];
    }
  });
});
var _FontMgr = require("./FontMgr");
Object.keys(_FontMgr).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _FontMgr[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _FontMgr[key];
    }
  });
});
var _FontMgrFactory = require("./FontMgrFactory");
Object.keys(_FontMgrFactory).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _FontMgrFactory[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _FontMgrFactory[key];
    }
  });
});
//# sourceMappingURL=index.js.map