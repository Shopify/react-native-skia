import type * as ReanimatedT from "react-native-reanimated";

import { createModuleProxy } from "../ModuleProxy";
type TReanimated = typeof ReanimatedT;

const Reanimated = createModuleProxy<TReanimated>(
  "react-native-reanimated",
  () => {
    return require("react-native-reanimated");
  }
);

// eslint-disable-next-line import/no-default-export
export default Reanimated;
