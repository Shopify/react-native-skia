import type { Vector } from "../types";
export declare const vec: (x?: number, y?: number) => import("../types").SkPoint;
export declare const point: (x?: number, y?: number) => import("../types").SkPoint;
export declare const neg: (a: Vector) => import("../types").SkPoint;
export declare const add: (a: Vector, b: Vector) => import("../types").SkPoint;
export declare const sub: (a: Vector, b: Vector) => import("../types").SkPoint;
export declare const dist: (a: Vector, b: Vector) => number;
