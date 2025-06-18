import type { SkJSIInstance } from "../JsiInstance";
import type { Vector } from "../Point";
import type { SkRuntimeEffect, SkRuntimeShaderBuilder } from "../RuntimeEffect";
export declare const isShader: (obj: SkJSIInstance<string> | null) => obj is SkShader;
export type SkShader = SkJSIInstance<"Shader">;
export type Uniform = number | Vector | Float32Array | readonly Uniform[] | Uniform[];
export interface Uniforms {
    [name: string]: Uniform;
}
export declare const processUniforms: (source: SkRuntimeEffect, uniforms: Uniforms, builder?: SkRuntimeShaderBuilder) => number[];
