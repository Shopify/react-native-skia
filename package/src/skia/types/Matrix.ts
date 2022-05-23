import type { SkJSIInstance } from "./JsiInstance";
export enum MatrixIndex {
  ScaleX = 0,
  SkewX = 1,
  TransX = 2,
  SkewY = 3,
  ScaleY = 4,
  TransY = 5,
  Persp0 = 6,
  Persp1 = 7,
  persp2 = 8,
}

export interface SkMatrix extends SkJSIInstance<"Matrix"> {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;

  preConcat: (matrix: SkMatrix) => void;
  preTranslate: (x: number, y: number) => void;
  preScale: (x: number, y: number) => void;
  preSkew: (x: number, y: number) => void;
  preRotate: (theta: number) => void;
}
