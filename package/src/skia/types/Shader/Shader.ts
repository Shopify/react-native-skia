import type { SkJSIInstance } from "../JsiInstance";
import type { Vector } from "../Point";
import type { SkRuntimeEffect, SkRuntimeShaderBuilder } from "../RuntimeEffect";

export const isShader = (obj: SkJSIInstance<string> | null): obj is SkShader =>
  obj !== null && obj.__typename__ === "Shader";

export type SkShader = SkJSIInstance<"Shader">;

export type UniformValue = number | Vector | readonly number[];

export type Uniform = UniformValue | readonly UniformValue[] | Float32Array;

export interface Uniforms {
  [name: string]: Uniform;
}

const isVector = (obj: unknown): obj is Vector =>
  // We have an issue to check property existence on JSI backed instances
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (obj as any).x !== undefined && (obj as any).y !== undefined;

const processValue = (value: UniformValue): number | readonly number[] => {
  if (isVector(value)) {
    return [value.x, value.y];
  }
  return value;
};

export const processUniforms = (
  source: SkRuntimeEffect,
  uniforms: Uniforms,
  builder?: SkRuntimeShaderBuilder
) => {
  const processed = new Array(source.getUniformCount())
    .fill(0)
    .flatMap((_, i) => {
      const name = source.getUniformName(i);
      const rawValue = uniforms[name];
      if (rawValue === undefined) {
        throw new Error(`No value specified for uniform ${name}`);
      }
      const value =
        rawValue instanceof Float32Array ? Array.from(rawValue) : rawValue;
      const result = Array.isArray(value)
        ? value.flatMap(processValue)
        : processValue(value as UniformValue);
      builder?.setUniform(name, typeof result === "number" ? [result] : result);
      return result;
    });
  const names = Object.keys(uniforms);
  if (names.length > source.getUniformCount()) {
    const usedUniforms = new Array(source.getUniformCount())
      .fill(0)
      .map((_, i) => source.getUniformName(i));
    const unusedUniform = names
      .map((name) => {
        if (usedUniforms.indexOf(name) === -1) {
          return name;
        }
        return null;
      })
      .filter((n) => n !== null);
    console.warn("Unused uniforms were provided: " + unusedUniform.join(", "));
  }
  return processed;
};
