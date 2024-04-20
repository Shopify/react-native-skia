import type * as ReanimatedT from "react-native-reanimated";
import {
  createModuleProxy,
  OptionalDependencyNotInstalledError,
} from "../ModuleProxy";

import original from "./ReanimatedProxy";
type TReanimated = typeof ReanimatedT;

const Reanimated: typeof original = createModuleProxy<TReanimated>(() => {
  throw new OptionalDependencyNotInstalledError("react-native-reanimated");
});

// eslint-disable-next-line import/no-default-export
export default Reanimated;
