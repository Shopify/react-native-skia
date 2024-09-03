import { Skia } from "../Skia";
import type { SkRect } from "../types";

export const rrect = (r: SkRect, rx: number, ry: number) => {
  "worklet";
  return Skia.RRectXY(r, rx, ry);
};
