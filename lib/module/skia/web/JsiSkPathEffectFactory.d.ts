import type { CanvasKit } from "canvaskit-wasm";
import type { Path1DEffectStyle, PathEffectFactory, SkMatrix, SkPath, SkPathEffect } from "../types";
import { Host } from "./Host";
import { JsiSkPathEffect } from "./JsiSkPathEffect";
export declare class JsiSkPathEffectFactory extends Host implements PathEffectFactory {
    constructor(CanvasKit: CanvasKit);
    MakeCorner(radius: number): JsiSkPathEffect | null;
    MakeDash(intervals: number[], phase?: number): JsiSkPathEffect;
    MakeDiscrete(segLength: number, dev: number, seedAssist: number): JsiSkPathEffect;
    MakeCompose(_outer: SkPathEffect, _inner: SkPathEffect): SkPathEffect;
    MakeSum(_outer: SkPathEffect, _inner: SkPathEffect): SkPathEffect;
    MakeLine2D(width: number, matrix: SkMatrix): JsiSkPathEffect | null;
    MakePath1D(path: SkPath, advance: number, phase: number, style: Path1DEffectStyle): JsiSkPathEffect | null;
    MakePath2D(matrix: SkMatrix, path: SkPath): JsiSkPathEffect | null;
}
