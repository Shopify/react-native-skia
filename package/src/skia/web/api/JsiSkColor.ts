import type { CanvasKit } from "canvaskit-wasm";

const alphaf = (c: number) => ((c >> 24) & 255) / 255;
const red = (c: number) => (c >> 16) & 255;
const green = (c: number) => (c >> 8) & 255;
const blue = (c: number) => c & 255;

// TODO: to remove once these are refactored
type SkColor = Float32Array;
type Color = string | Float32Array | number;

export const Color = (CanvasKit: CanvasKit, color: Color): SkColor => {
  if (color instanceof Float32Array) {
    return color;
  } else if (typeof color === "string") {
    return CanvasKit.parseColorString(color);
  } else {
    return Float32Array.of(
      red(color) / 255,
      green(color) / 255,
      blue(color) / 255,
      alphaf(color)
    );
  }
};
