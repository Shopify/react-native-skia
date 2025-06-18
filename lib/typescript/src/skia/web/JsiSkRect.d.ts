import type { CanvasKit, Rect } from "canvaskit-wasm";
import type { SkHostRect, SkRect } from "../types";
import { BaseHostObject } from "./Host";
export declare class JsiSkRect extends BaseHostObject<Rect, "Rect"> implements SkHostRect {
    static fromValue(CanvasKit: CanvasKit, rect: SkRect): Rect;
    dispose: () => void;
    constructor(CanvasKit: CanvasKit, ref: Rect);
    setXYWH(x: number, y: number, width: number, height: number): void;
    get x(): number;
    get y(): number;
    get width(): number;
    get height(): number;
}
