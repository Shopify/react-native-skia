import type { SkJSIInstance } from "../JsiInstance";
import type { Vector } from "../Point";

export const isShader = (obj: SkJSIInstance<string> | null): obj is SkShader =>
  obj !== null && obj.__typename__ === "Shader";

export type SkShader = SkJSIInstance<"Shader">;

export type UniformValue = number | Vector | readonly number[];

export type Uniform = UniformValue | readonly UniformValue[];

export interface Uniforms {
  [name: string]: Uniform;
}
