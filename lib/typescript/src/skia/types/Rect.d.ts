import type { SkJSIInstance } from "./JsiInstance";
export interface SkRect {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}
export interface SkHostRect extends SkRect, SkJSIInstance<"Rect"> {
    setXYWH(x: number, y: number, width: number, height: number): void;
}
export declare const isRect: (def: unknown) => def is SkRect;
