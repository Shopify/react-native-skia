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

type UniformValue =
  | number
  | Vector
  | readonly [number, number]
  | readonly [number, number, number]
  | readonly [number, number, number, number];

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

const isUniformArray = (value: Uniform): value is UniformValue =>
  Array.isArray(value);

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
      .map((_, i) => {
        const name = source.getUniformName(i);
        const value: Uniform = uniforms[name];
        if (!isUniformArray(value)) {
          return value.flatMap(processValue);
        }
        return processValue(value);
      })
      .flat(4);
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
