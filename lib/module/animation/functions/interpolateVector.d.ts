import type { Vector } from "../../skia/types";
import { interpolate } from "./interpolate";
export declare const interpolateVector: (value: number, inputRange: readonly number[], outputRange: readonly Vector[], options?: Parameters<typeof interpolate>[3]) => {
    x: number;
    y: number;
};
export declare const mixVector: (value: number, from: Vector, to: Vector) => {
    x: number;
    y: number;
};
