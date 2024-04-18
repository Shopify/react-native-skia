import type * as ReanimatedT from "react-native-reanimated";

import { createModuleProxy } from "../ModuleProxy";
type TReanimated = typeof ReanimatedT;

export const Reanimated = createModuleProxy<TReanimated>(
  "react-native-reanimated",
  () => {
    return require("react-native-reanimated");
  }
);
