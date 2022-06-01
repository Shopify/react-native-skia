import { Skia } from "../Skia";
import type { SkRect } from "../types";

export const rrect = (r: SkRect, rx: number, ry: number) =>
  Skia.RRectXY(r, rx, ry);
