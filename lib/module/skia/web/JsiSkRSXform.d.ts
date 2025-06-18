import type { CanvasKit } from "canvaskit-wasm";
import type { SkRSXform } from "../types";
import { BaseHostObject } from "./Host";
export type RSXform = Float32Array;
export declare class JsiSkRSXform extends BaseHostObject<RSXform, "RSXform"> implements SkRSXform {
    static fromValue(rsxform: SkRSXform): Float32Array<ArrayBuffer>;
    constructor(CanvasKit: CanvasKit, ref: RSXform);
    set(scos: number, ssin: number, tx: number, ty: number): void;
    get scos(): number;
    get ssin(): number;
    get tx(): number;
    get ty(): number;
    dispose: () => void;
}
