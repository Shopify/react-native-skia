import type { CanvasKit, PathEffect } from "canvaskit-wasm";
import type { SkPathEffect } from "../types/PathEffect";
import { HostObject } from "./Host";
export declare class JsiSkPathEffect extends HostObject<PathEffect, "PathEffect"> implements SkPathEffect {
    constructor(CanvasKit: CanvasKit, ref: PathEffect);
    dispose: () => void;
}
