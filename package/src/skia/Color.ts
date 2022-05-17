import { Skia } from "./Skia";

// This is the JSI color
export type SkColor = Float32Array;
// Input colors can be string, number or Float32Array
export type Color = string | Float32Array | number;

export const RED = 0;
export const GREEN = 1;
export const BLUE = 2;
export const ALPHA = 3;

export const BLACK = new Float32Array([0, 0, 0, 1]);
export const WHITE = new Float32Array([1, 1, 1, 1]);

const alphaf = (c: number) => ((c >> 24) & 255) / 255;
const red = (c: number) => (c >> 16) & 255;
const green = (c: number) => (c >> 8) & 255;
const blue = (c: number) => c & 255;

export const Color = (cl: Color): SkColor => {
  if (typeof cl === "number") {
    return new Float32Array([
      red(cl) / 255,
      green(cl) / 255,
      blue(cl) / 255,
      alphaf(cl),
    ]);
  }
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
