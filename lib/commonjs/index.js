"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  JsiSkImage: true
};
Object.defineProperty(exports, "JsiSkImage", {
  enumerable: true,
  get: function () {
    return _reactNativeSkia.JsiSkImage;
  }
});
require("@shopify/react-native-skia/src/skia/NativeSetup");
var _reactNativeSkia = require("@shopify/react-native-skia");
Object.keys(_reactNativeSkia).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _reactNativeSkia[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _reactNativeSkia[key];
    }
  });
});
//# sourceMappingURL=index.js.map