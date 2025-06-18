"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _ModuleProxy = require("../ModuleProxy");
const Reanimated = (0, _ModuleProxy.createModuleProxy)(() => {
  try {
    return require("react-native-reanimated");
  } catch (e) {
    throw new _ModuleProxy.OptionalDependencyNotInstalledError("react-native-reanimated");
  }
});

// eslint-disable-next-line import/no-default-export
var _default = exports.default = Reanimated;
//# sourceMappingURL=ReanimatedProxy.js.map