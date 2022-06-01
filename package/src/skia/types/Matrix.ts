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
  preConcat: (matrix: SkMatrix) => void;
  preTranslate: (x: number, y: number) => void;
  preScale: (x: number, y: number) => void;
  preSkew: (x: number, y: number) => void;
  preRotate: (theta: number) => void;
}

type Transform2dName =
  | "translateX"
  | "translateY"
  | "scale"
  | "skewX"
  | "skewY"
  | "scaleX"
  | "scaleY"
  | "rotateZ"
  | "rotate";

type Transformations = {
  readonly [Name in Transform2dName]: number;
};

export type Transforms2d = readonly (
  | Pick<Transformations, "translateX">
  | Pick<Transformations, "translateY">
  | Pick<Transformations, "scale">
  | Pick<Transformations, "scaleX">
  | Pick<Transformations, "scaleY">
  | Pick<Transformations, "skewX">
  | Pick<Transformations, "skewY">
  | Pick<Transformations, "rotate">
)[];

export interface TransformProp {
  transform?: Transforms2d;
}

export const processTransform = (m: SkMatrix, transforms: Transforms2d) => {
  for (const transform of transforms) {
    const key = Object.keys(transform)[0] as Transform2dName;
    const value = (transform as Pick<Transformations, typeof key>)[key];
    if (key === "translateX") {
      m.preTranslate(value, 0);
      continue;
    }
    if (key === "translateY") {
      m.preTranslate(0, value);
      continue;
    }
    if (key === "scale") {
      m.preScale(value, value);
      continue;
    }
    if (key === "scaleX") {
      m.preScale(value, 1);
      continue;
    }
    if (key === "scaleY") {
      m.preScale(1, value);
      continue;
    }
    if (key === "skewX") {
      m.preSkew(value, 0);
      continue;
    }
    if (key === "skewY") {
      m.preSkew(0, value);
      continue;
    }
    if (key === "rotate" || key === "rotateZ") {
      m.preRotate((value * 180) / Math.PI);
      continue;
    }
    exhaustiveCheck(key);
  }
  return m;
};

const exhaustiveCheck = (a: never): never => {
  throw new Error(`Unknown transformation: ${a}`);
};
