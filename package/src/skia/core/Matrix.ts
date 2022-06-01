import { Skia } from "../Skia";
import type { Transforms2d } from "../types";
import { processTransform } from "../types";

export const processTransform2d = (transforms: Transforms2d) =>
  processTransform(Skia.Matrix(), transforms);
