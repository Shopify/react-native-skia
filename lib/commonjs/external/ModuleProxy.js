"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createModuleProxy = exports.OptionalDependencyNotInstalledError = void 0;
// https://github.com/mrousavy/react-native-vision-camera/blob/main/package/src/dependencies/ModuleProxy.ts

/**
 * Create a lazily-imported module proxy.
 * This is useful for lazily requiring optional dependencies.
 */
const createModuleProxy = getModule => {
  const holder = {
    module: undefined
  };
  const proxy = new Proxy(holder, {
    get: (target, property) => {
      if (target.module == null) {
        // lazy initialize module via require()
        // caller needs to make sure the require() call is wrapped in a try/catch
        target.module = getModule();
      }
      return target.module[property];
    }
  });
  return proxy;
};
exports.createModuleProxy = createModuleProxy;
class OptionalDependencyNotInstalledError extends Error {
  constructor(name) {
    super(`${name} is not installed!`);
  }
}
exports.OptionalDependencyNotInstalledError = OptionalDependencyNotInstalledError;
//# sourceMappingURL=ModuleProxy.js.map