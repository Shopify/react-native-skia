import type { IShader } from "./Shader";
import type { TileMode } from "./ImageFilter";

export interface IGradientShader {
  linear: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    colors: number[],
    positions: number[],
    tileMode: TileMode
  ) => IShader;
  radial: (
    x: number,
    y: number,
    r: number,
    colors: number[],
    positions: number[],
    tileMode: TileMode
  ) => IShader;
}
