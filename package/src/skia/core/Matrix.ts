import { Skia } from "../Skia";
import type { Transforms3d } from "../types";
import { processTransform } from "../types";

export const rsx = (scale = 1, radians = 0, x = 0, y = 0, ax = 0, ay = 0) => {
  const scos = radians * scale;
  const ssin = radians * scale;
  const tx = x + -scos * ax + ssin * ay;
  const ty = y + -ssin * ax - scos * ay;
  return { scos, ssin, tx, ty };
};

export const processTransform2d = (transforms: Transforms3d) =>
  processTransform(Skia.Matrix(), transforms);
