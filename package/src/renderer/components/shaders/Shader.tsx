import React from "react";
import type { ReactNode } from "react";

import { isShader } from "../../../skia";
import type { IRuntimeEffect } from "../../../skia";
import type { Vector, AnimatedProps, TransformProps } from "../../processors";
import { useDeclaration } from "../../nodes/Declaration";
import { localMatrix } from "../../processors";
import { hasProperty } from "../../typeddash";

const isVector = (obj: unknown): obj is Vector =>
  hasProperty(obj, "x") && hasProperty(obj, "y");

type Uniform = number | number[] | Vector;

interface Uniforms {
  [name: string]: Uniform;
}

export interface ShaderProps extends TransformProps {
  source: IRuntimeEffect;
  uniforms: Uniforms;
  isOpaque?: boolean;
  children?: ReactNode | ReactNode[];
}

export const Shader = (props: AnimatedProps<ShaderProps>) => {
  const declaration = useDeclaration<ShaderProps>(
    props,
    ({ uniforms, source, isOpaque, ...transform }, children) => {
      const processedUniforms = new Array(source.getUniformCount())
        .fill(0)
        .map((_, i) => {
          const name = source.getUniformName(i);
          const value = uniforms[name];
          if (isVector(value)) {
            return [value.x, value.y];
          }
          return value;
        })
        .flat(4);
      return source.makeShaderWithChildren(
        processedUniforms,
        isOpaque,
        children.filter(isShader),
        localMatrix(transform)
      );
    }
  );
  return <skDeclaration declaration={declaration} {...props} />;
};

Shader.defaultProps = {
  uniforms: [],
};
