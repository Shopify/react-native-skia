import { Skia } from "../../../skia";
import { exhaustiveCheck } from "../../typeddash";

export type Vec3 = readonly [number, number, number];

export type Matrix3 = readonly [Vec3, Vec3, Vec3];

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

export interface TransformProp {
  transform?: Transforms2d;
}

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

const identityMatrix: Matrix3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

const translateXMatrix = (x: number): Matrix3 => [
  [1, 0, x],
  [0, 1, 0],
  [0, 0, 1],
];

const translateYMatrix = (y: number): Matrix3 => [
  [1, 0, 0],
  [0, 1, y],
  [0, 0, 1],
];

const scaleMatrix = (s: number): Matrix3 => [
  [s, 0, 0],
  [0, s, 0],
  [0, 0, 1],
];

const scaleXMatrix = (s: number): Matrix3 => [
  [s, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

const scaleYMatrix = (s: number): Matrix3 => [
  [1, 0, 0],
  [0, s, 0],
  [0, 0, 1],
];

const skewXMatrix = (s: number): Matrix3 => [
  [1, Math.tan(s), 0],
  [0, 1, 0],
  [0, 0, 1],
];

const skewYMatrix = (s: number): Matrix3 => [
  [1, 0, 0],
  [Math.tan(s), 1, 0],
  [0, 0, 1],
];

const rotateZMatrix = (r: number): Matrix3 => [
  [Math.cos(r), -1 * Math.sin(r), 0],
  [Math.sin(r), Math.cos(r), 0],
  [0, 0, 1],
];

export const dot3 = (row: Vec3, col: Vec3) =>
  row[0] * col[0] + row[1] * col[1] + row[2] * col[2];

export const matrixVecMul3 = (m: Matrix3, v: Vec3) =>
  [dot3(m[0], v), dot3(m[1], v), dot3(m[2], v)] as const;

export const multiply3 = (m1: Matrix3, m2: Matrix3) => {
  const col0 = [m2[0][0], m2[1][0], m2[2][0]] as const;
  const col1 = [m2[0][1], m2[1][1], m2[2][1]] as const;
  const col2 = [m2[0][2], m2[1][2], m2[2][2]] as const;
  return [
    [dot3(m1[0], col0), dot3(m1[0], col1), dot3(m1[0], col2)],
    [dot3(m1[1], col0), dot3(m1[1], col1), dot3(m1[1], col2)],
    [dot3(m1[2], col0), dot3(m1[2], col1), dot3(m1[2], col2)],
  ] as const;
};

export const transformSvg = (transform: Transforms2d) =>
  serializeToSVG(processTransform2d(transform));

export const serializeToSVG = (m: Matrix3) =>
  `matrix(${m[0][0]}, ${m[1][0]}, ${m[0][1]}, ${m[1][1]}, ${m[0][2]}, ${m[1][2]})`;

export const skiaMatrix3 = (m: Matrix3) => {
  const r = Skia.Matrix();
  r.set(0, m[0][0]);
  r.set(1, m[0][1]);
  r.set(2, m[0][2]);
  r.set(3, m[1][0]);
  r.set(4, m[1][1]);
  r.set(5, m[1][2]);
  r.set(6, m[2][0]);
  r.set(7, m[2][1]);
  r.set(8, m[2][2]);
  return r;
};

export const processTransform2d = (transforms: Transforms2d) =>
  transforms.reduce((acc, transform) => {
    const key = Object.keys(transform)[0] as Transform2dName;
    const value = (transform as Pick<Transformations, typeof key>)[key];
    if (key === "translateX") {
      return multiply3(acc, translateXMatrix(value));
    }
    if (key === "translateY") {
      return multiply3(acc, translateYMatrix(value));
    }
    if (key === "scale") {
      return multiply3(acc, scaleMatrix(value));
    }
    if (key === "scaleX") {
      return multiply3(acc, scaleXMatrix(value));
    }
    if (key === "scaleY") {
      return multiply3(acc, scaleYMatrix(value));
    }
    if (key === "skewX") {
      return multiply3(acc, skewXMatrix(value));
    }
    if (key === "skewY") {
      return multiply3(acc, skewYMatrix(value));
    }
    if (key === "rotate" || key === "rotateZ") {
      return multiply3(acc, rotateZMatrix(value));
    }
    return exhaustiveCheck(key);
  }, identityMatrix);

const isMatrix3 = (arg: Matrix3 | Transforms2d): arg is Matrix3 =>
  arg.length === 3 && arg[0] instanceof Array;

// https://math.stackexchange.com/questions/13150/extracting-rotation-scale-values-from-2d-transformation-matrix
export const decompose2d = (arg: Matrix3 | Transforms2d) => {
  const m = isMatrix3(arg) ? arg : processTransform2d(arg);
  const a = m[0][0];
  const b = m[1][0];
  const c = m[0][1];
  const d = m[1][1];
  const translateX = m[0][2];
  const translateY = m[1][2];
  const E = (a + d) / 2;
  const F = (a - d) / 2;
  const G = (c + b) / 2;
  const H = (c - b) / 2;
  const Q = Math.sqrt(Math.pow(E, 2) + Math.pow(H, 2));
  const R = Math.sqrt(Math.pow(F, 2) + Math.pow(G, 2));
  const scaleX = Q + R;
  const scaleY = Q - R;
  const a1 = Math.atan2(G, F);
  const a2 = Math.atan2(H, E);
  const theta = (a2 - a1) / 2;
  const phi = (a2 + a1) / 2;
  return [
    { translateX },
    { translateY },
    { rotateZ: -1 * theta },
    { scaleX },
    { scaleY },
    { rotateZ: -1 * phi },
  ] as const;
};
