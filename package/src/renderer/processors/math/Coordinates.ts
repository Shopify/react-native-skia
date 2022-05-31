import type { Vector } from "../../../skia/types";

export interface PolarPoint {
  theta: number;
  radius: number;
}

export const canvas2Cartesian = (v: Vector, center: Vector) => ({
  x: v.x - center.x,
  y: -1 * (v.y - center.y),
});

export const cartesian2Canvas = (v: Vector, center: Vector) => ({
  x: v.x + center.x,
  y: -1 * v.y + center.y,
});

export const cartesian2Polar = (v: Vector) => ({
  theta: Math.atan2(v.y, v.x),
  radius: Math.sqrt(v.x ** 2 + v.y ** 2),
});

export const polar2Cartesian = (p: PolarPoint) => ({
  x: p.radius * Math.cos(p.theta),
  y: p.radius * Math.sin(p.theta),
});

export const polar2Canvas = (p: PolarPoint, center: Vector) =>
  cartesian2Canvas(polar2Cartesian(p), center);

export const canvas2Polar = (v: Vector, center: Vector) =>
  cartesian2Polar(canvas2Cartesian(v, center));
