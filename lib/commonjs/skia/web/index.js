"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _JsiSkia = require("./JsiSkia");
Object.keys(_JsiSkia).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _JsiSkia[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _JsiSkia[key];
    }
  });
});
//# sourceMappingURL=index.js.map