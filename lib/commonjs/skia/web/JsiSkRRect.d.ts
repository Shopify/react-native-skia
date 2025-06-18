import type { CanvasKit, RRect } from "canvaskit-wasm";
import type { InputRRect, SkRect, SkRRect } from "../types";
import { BaseHostObject } from "./Host";
import { JsiSkRect } from "./JsiSkRect";
export declare class JsiSkRRect extends BaseHostObject<RRect, "RRect"> implements SkRRect {
    dispose: () => void;
    static fromValue(CanvasKit: CanvasKit, rect: InputRRect): Float32Array<ArrayBuffer>;
    constructor(CanvasKit: CanvasKit, rect: SkRect, rx: number, ry: number);
    get rx(): number;
    get ry(): number;
    get rect(): JsiSkRect;
}
