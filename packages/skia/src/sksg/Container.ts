import type { Skia } from "../skia/types";

import { StaticContainer } from "./StaticContainer";

export const createContainer = (Skia: Skia, nativeId: number) => {
  return new StaticContainer(Skia, nativeId);
};
