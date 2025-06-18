import type { CanvasKit } from "canvaskit-wasm";
import type { BlendMode, SkColor, SkMatrix, SkPoint, SkShader, TileMode } from "../types";
import type { ShaderFactory } from "../types/Shader/ShaderFactory";
import { Host } from "./Host";
import { JsiSkShader } from "./JsiSkShader";
export declare class JsiSkShaderFactory extends Host implements ShaderFactory {
    constructor(CanvasKit: CanvasKit);
    MakeLinearGradient(start: SkPoint, end: SkPoint, colors: SkColor[], pos: number[] | null, mode: TileMode, localMatrix?: SkMatrix, flags?: number): JsiSkShader;
    MakeRadialGradient(center: SkPoint, radius: number, colors: SkColor[], pos: number[] | null, mode: TileMode, localMatrix?: SkMatrix, flags?: number): JsiSkShader;
    MakeTwoPointConicalGradient(start: SkPoint, startRadius: number, end: SkPoint, endRadius: number, colors: SkColor[], pos: number[] | null, mode: TileMode, localMatrix?: SkMatrix, flags?: number): JsiSkShader;
    MakeSweepGradient(cx: number, cy: number, colors: SkColor[], pos: number[] | null, mode: TileMode, localMatrix?: SkMatrix | null, flags?: number, startAngleInDegrees?: number, endAngleInDegrees?: number): JsiSkShader;
    MakeTurbulence(baseFreqX: number, baseFreqY: number, octaves: number, seed: number, tileW: number, tileH: number): JsiSkShader;
    MakeFractalNoise(baseFreqX: number, baseFreqY: number, octaves: number, seed: number, tileW: number, tileH: number): JsiSkShader;
    MakeBlend(mode: BlendMode, one: SkShader, two: SkShader): JsiSkShader;
    MakeColor(color: SkColor): JsiSkShader;
}
