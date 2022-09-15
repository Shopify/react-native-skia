import type { SkJSIInstance } from "../JsiInstance";
export enum MatrixIndex {
  ScaleX = 0,
  SkewX = 1,
  TransX = 2,
  SkewY = 3,
  ScaleY = 4,
  TransY = 5,
  Persp0 = 6,
  Persp1 = 7,
  Persp2 = 8,
}

export const isMatrix = (obj: unknown): obj is SkMatrix =>
  obj !== null && (obj as SkJSIInstance<string>).__typename__ === "Matrix";

export interface SkMatrix extends SkJSIInstance<"Matrix"> {
  concat: (matrix: SkMatrix) => void;
  translate: (x: number, y: number) => void;
  scale: (x: number, y?: number) => void;
  skew: (x: number, y: number) => void;
  rotate: (theta: number) => void;
  identity: () => void;
  get: () => number[];
}
