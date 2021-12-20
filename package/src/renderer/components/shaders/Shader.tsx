import React from "react";
import type { ReactNode } from "react";

import { isShader } from "../../../skia";
import type { IRuntimeEffect } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps, TransformProps } from "../../processors";
import { localMatrix } from "../../processors";

export interface ShaderProps extends TransformProps {
  source: IRuntimeEffect;
  uniforms: number[];
  isOpaque?: boolean;
  children?: ReactNode | ReactNode[];
}

export const Shader = (props: AnimatedProps<ShaderProps>) => {
  const declaration = useDeclaration<ShaderProps>(
    props,
    ({ uniforms, source, isOpaque, ...transform }, children) => {
      return source.makeShaderWithChildren(
        uniforms,
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
