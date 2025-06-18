import type { CanvasKit, Matrix3x3 } from "canvaskit-wasm";
import type { SkMatrix, InputMatrix } from "../types";
import { HostObject } from "./Host";
export declare class JsiSkMatrix extends HostObject<Matrix3x3, "Matrix"> implements SkMatrix {
    constructor(CanvasKit: CanvasKit, ref: Matrix3x3);
    private preMultiply;
    private postMultiply;
    dispose: () => void;
    concat(matrix: InputMatrix): this;
    translate(x: number, y: number): this;
    postTranslate(x: number, y: number): this;
    scale(x: number, y?: number): this;
    postScale(x: number, y?: number): this;
    skew(x: number, y: number): this;
    postSkew(x: number, y: number): this;
    rotate(value: number): this;
    postRotate(value: number): this;
    identity(): this;
    get(): number[];
}
