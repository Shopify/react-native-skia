import type { Rect } from "./Rect";
import type { SkJsiInstane } from "./JsiInstance";

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

export enum ScaleToFit {
  Fill = 0,
  Start = 1,
  Center = 2,
  End = 3,
}

export interface Matrix extends SkJsiInstane<"Matrix"> {
  set(i: number, v: number): void;
  get(i: number): number;

  setScaleX(sx: number): void;
  getScaleX(): number;

  setScaleY(sy: number): void;
  getScaleY(): number;

  setSkewX(sx: number): void;
  getSkewX(): number;

  setSkewY(sy: number): void;
  getSkewY(): number;

  setTranslateX(tx: number): void;
  getTranslateX(): number;

  setTranslateY(ty: number): void;
  getTranslateY(): number;

  setPerspX(px: number): void;
  getPerspX(): number;

  setPerspY(px: number): void;
  getPerspY(): number;

  setRectToRect(src: Rect, dest: Rect, fit: ScaleToFit): void;
}
