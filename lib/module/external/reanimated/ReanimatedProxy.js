import { OptionalDependencyNotInstalledError, createModuleProxy } from "../ModuleProxy";
const Reanimated = createModuleProxy(() => {
  try {
    return require("react-native-reanimated");
  } catch (e) {
    throw new OptionalDependencyNotInstalledError("react-native-reanimated");
  }
});

// eslint-disable-next-line import/no-default-export
export default Reanimated;
//# sourceMappingURL=ReanimatedProxy.js.map