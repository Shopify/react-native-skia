import { Skia } from "../Skia";
import type { Transforms3d } from "../types";
import { processTransform } from "../types";

export const processTransform2d = (transforms: Transforms3d) =>
  processTransform(Skia.Matrix(), transforms);
