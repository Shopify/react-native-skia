import type { SkPoint } from "./Point";
import type { SkRect } from "./Rect";
export interface SkRRect {
    readonly rect: SkRect;
    readonly rx: number;
    readonly ry: number;
}
export interface NonUniformRRect {
    readonly rect: SkRect;
    readonly topLeft: SkPoint;
    readonly topRight: SkPoint;
    readonly bottomRight: SkPoint;
    readonly bottomLeft: SkPoint;
}
export type InputRRect = SkRRect | NonUniformRRect;
export declare const isRRect: (def: unknown) => def is SkRRect;
