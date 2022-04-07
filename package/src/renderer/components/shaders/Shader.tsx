import React from "react";
import type { ReactNode } from "react";

import { isShader } from "../../../skia";
import type { IRuntimeEffect } from "../../../skia";
import type { Vector, AnimatedProps, TransformProps } from "../../processors";
import { createDeclaration } from "../../nodes/Declaration";
import { localMatrix } from "../../processors";

// We need to use any here because hasOwnProperty doesn't work on JSI instances
const isVector = (obj: unknown): obj is Vector =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (obj as any).x !== undefined && (obj as any).y !== undefined;

type UniformValue = number | Vector | readonly number[];

type Uniform = UniformValue | readonly UniformValue[];

interface Uniforms {
  [name: string]: Uniform;
}

const processValue = (value: UniformValue): number | readonly number[] => {
  if (isVector(value)) {
    return [value.x, value.y];
  }
  return value;
};

export interface ShaderProps extends TransformProps {
  source: IRuntimeEffect;
  uniforms: Uniforms;
  opaque?: boolean;
  children?: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<ShaderProps>(
  ({ uniforms, source, opaque, ...transform }, children) => {
    const processedUniforms = new Array(source.getUniformCount())
      .fill(0)
      .flatMap((_, i) => {
        const name = source.getUniformName(i);
        const value = uniforms[name];
        if (value === undefined) {
          throw new Error(`No value specified for uniform ${name}`);
        }
        if (Array.isArray(value)) {
          return value.flatMap(processValue);
        }
        return processValue(value as UniformValue);
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
      console.warn(
        "Unused uniforms were provided: " + unusedUniform.join(", ")
      );
    }
    return source.makeShaderWithChildren(
      processedUniforms,
      opaque,
      children.filter(isShader),
      localMatrix(transform)
    );
  }
);

export const Shader = (props: AnimatedProps<ShaderProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

Shader.defaultProps = {
  uniforms: [],
};
