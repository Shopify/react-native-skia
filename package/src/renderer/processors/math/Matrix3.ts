import { exhaustiveCheck } from "../../typeddash";
import type { SkMatrix } from "../../../skia/Matrix";

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

const dot3 = (row: Vec3, col: Vec3) =>
  row[0] * col[0] + row[1] * col[1] + row[2] * col[2];

const multiply3 = (m1: Matrix3, m2: Matrix3) => {
  const col0 = [m2[0][0], m2[1][0], m2[2][0]] as const;
  const col1 = [m2[0][1], m2[1][1], m2[2][1]] as const;
  const col2 = [m2[0][2], m2[1][2], m2[2][2]] as const;
  return [
    [dot3(m1[0], col0), dot3(m1[0], col1), dot3(m1[0], col2)],
    [dot3(m1[1], col0), dot3(m1[1], col1), dot3(m1[1], col2)],
    [dot3(m1[2], col0), dot3(m1[2], col1), dot3(m1[2], col2)],
  ] as const;
};

export const matrixVecMul3 = (m: Matrix3, v: Vec3) =>
  [dot3(m[0], v), dot3(m[1], v), dot3(m[2], v)] as const;

const skiaMatrix3 = (m: Matrix3): SkMatrix => {
  return [
    m[0][0],
    m[0][1],
    m[0][2],
    m[1][0],
    m[1][1],
    m[1][2],
    m[2][0],
    m[2][1],
    m[2][2],
  ];
};

export const processTransform2d = (transforms: Transforms2d) =>
  skiaMatrix3(processTransform(transforms));

const processTransform = (transforms: Transforms2d) =>
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
