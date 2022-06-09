import React from "react";
import type { ReactNode } from "react";

import type { SkRuntimeEffect, Uniforms } from "../../../skia/types";
import { isShader, processUniforms } from "../../../skia/types";
import type { AnimatedProps, TransformProps } from "../../processors";
import { createDeclaration } from "../../nodes/Declaration";
import { localMatrix } from "../../processors";

export interface ShaderProps extends TransformProps {
  source: SkRuntimeEffect;
  uniforms: Uniforms;
  children?: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<ShaderProps>(
  ({ uniforms, source, ...transform }, children, { Skia }) => {
    return source.makeShaderWithChildren(
      processUniforms(source, uniforms),
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
