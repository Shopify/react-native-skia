import type * as ReanimatedT from "react-native-reanimated";

import {
  OptionalDependencyNotInstalledError,
  createModuleProxy,
} from "../ModuleProxy";
type TReanimated = typeof ReanimatedT;

const Reanimated = createModuleProxy<TReanimated>(() => {
  try {
    return require("react-native-reanimated");
  } catch (e) {
    throw new OptionalDependencyNotInstalledError("react-native-reanimated");
  }
});

// eslint-disable-next-line import/no-default-export
export default Reanimated;
