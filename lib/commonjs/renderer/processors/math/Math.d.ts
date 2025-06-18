/**
 * Linear interpolation
 * @param value
 * @param x
 * @param y
 */
export declare const mix: (value: number, x: number, y: number) => number;
/**
 *  @summary Clamps a node with a lower and upper bound.
 *  @example
    clamp(-1, 0, 100); // 0
    clamp(1, 0, 100); // 1
    clamp(101, 0, 100); // 100
  */
export declare const clamp: (value: number, lowerBound: number, upperBound: number) => number;
export declare const saturate: (value: number) => number;
