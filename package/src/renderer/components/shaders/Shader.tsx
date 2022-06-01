import React from "react";
import type { ReactNode } from "react";

import type { Vector, SkRuntimeEffect } from "../../../skia/types";
import { isShader } from "../../../skia/types";
import type { AnimatedProps, TransformProps } from "../../processors";
import { createDeclaration } from "../../nodes/Declaration";
import { localMatrix } from "../../processors";

const isVector = (obj: unknown): obj is Vector =>
  // We have an issue to check property existence on JSI backed instances
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
  source: SkRuntimeEffect;
  uniforms: Uniforms;
  children?: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<ShaderProps>(
  ({ uniforms, source, ...transform }, children, { Skia }) => {
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
      children.filter(isShader),
      localMatrix(Skia.Matrix(), transform)
    );
  }
);

export const Shader = (props: AnimatedProps<ShaderProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

Shader.defaultProps = {
  uniforms: [],
};
