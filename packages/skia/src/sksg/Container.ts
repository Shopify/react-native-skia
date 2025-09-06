import type { SharedValue } from "react-native-reanimated";

import type { Skia, SkSize } from "../skia/types";

import { StaticContainer } from "./StaticContainer";

export const createContainer = (
  Skia: Skia,
  nativeId: number,
  _onSize?: SharedValue<SkSize>
) => {
  return new StaticContainer(Skia, nativeId);
};
