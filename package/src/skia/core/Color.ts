import { Skia } from "../Skia";
import type { Color } from "../types";

export const RED = 0;
export const GREEN = 1;
export const BLUE = 2;
export const ALPHA = 3;

export const rgbaColor = (r: number, g: number, b: number, a: number) =>
  new Float32Array([r, g, b, a]);

export const processColor = (cl: Color, currentOpacity: number) => {
  const color = Skia.Color(cl);
  color[ALPHA] *= currentOpacity;
  return color;
};
