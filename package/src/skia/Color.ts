import { Skia } from "./Skia";

// This is the JSI color
export type SkColor = Float32Array;
// Input colors can be string or number
export type Color = string | Float32Array;

export const RED = 0;
export const GREEN = 1;
export const BLUE = 2;
export const ALPHA = 3;

export const BLACK = new Float32Array([0, 0, 0, 1]);
export const WHITE = new Float32Array([1, 1, 1, 1]);

export const Color = (cl: Color): SkColor => {
  if (cl instanceof Float32Array) {
    return cl;
  }
  const color = Skia.parseColorString(cl);
  if (color !== undefined) {
    return color;
  } else {
    console.warn("Skia couldn't parse the following color " + cl);
    return BLACK;
  }
};

export const rgbaColor = (r: number, g: number, b: number, a: number) =>
  new Float32Array([r, g, b, a]);

export const processColor = (cl: Color, currentOpacity: number) => {
  const color = Color(cl);
  color[ALPHA] *= currentOpacity;
  return color;
};
