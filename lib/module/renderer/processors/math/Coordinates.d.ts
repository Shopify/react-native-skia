import type { Vector } from "../../../skia/types";
export interface PolarPoint {
    theta: number;
    radius: number;
}
export declare const canvas2Cartesian: (v: Vector, center: Vector) => {
    x: number;
    y: number;
};
export declare const cartesian2Canvas: (v: Vector, center: Vector) => {
    x: number;
    y: number;
};
export declare const cartesian2Polar: (v: Vector) => {
    theta: number;
    radius: number;
};
export declare const polar2Cartesian: (p: PolarPoint) => {
    x: number;
    y: number;
};
export declare const polar2Canvas: (p: PolarPoint, center: Vector) => {
    x: number;
    y: number;
};
export declare const canvas2Polar: (v: Vector, center: Vector) => {
    theta: number;
    radius: number;
};
