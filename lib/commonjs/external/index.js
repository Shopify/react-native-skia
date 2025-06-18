"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _reanimated = require("./reanimated");
Object.keys(_reanimated).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _reanimated[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _reanimated[key];
    }
  });
});
//# sourceMappingURL=index.js.map