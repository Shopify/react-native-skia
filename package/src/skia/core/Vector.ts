import { Skia } from "../Skia";
import type { Vector } from "../types";

export const vec = (x = 0, y?: number) => {
  "worklet";
  return Skia.Point(x, y ?? x);
};
export const point = vec;
export const neg = (a: Vector) => {
  "worklet";
  return vec(-a.x, -a.y);
};
export const add = (a: Vector, b: Vector) => {
  "worklet";
  return vec(a.x + b.x, a.y + b.y);
};
export const sub = (a: Vector, b: Vector) => {
  "worklet";
  return vec(a.x - b.x, a.y - b.y);
};
export const dist = (a: Vector, b: Vector) => {
  "worklet";
  return Math.hypot(a.x - b.x, a.y - b.y);
};
